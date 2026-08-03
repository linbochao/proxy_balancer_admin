import { connectorsByAgentType, connectorsDistribution } from '@/api'

export interface ConnectorItem {
  connectorId: string
  connectorName: string
  protocol: string
  port: number
  brokerCount: number
  status: string
}

export interface Broker {
  id: string
  brokerInstanceId: string
  [key: string]: any
}

export function useConnectorList(agentType: number) {
  const connectorList = ref<ConnectorItem[]>([])
  const connectionLoading = ref(false)
  const selectedConnector = ref<ConnectorItem | null>(null)

  const brokerList = ref<Broker[]>([])
  const brokerTotal = ref(0)
  const brokerLoading = ref(false)

  async function fetchList() {
    connectionLoading.value = true
    try {
      const res = await connectorsByAgentType({ agentType })
      const raw: any = res.data
      const list: ConnectorItem[] = []

      if (Array.isArray(raw)) {
        raw.forEach((group: any) => {
          if (Array.isArray(group.connectors)) {
            group.connectors.forEach((c: any) => {
              list.push({
                connectorId: c.connectorId,
                connectorName: c.connectorName,
                protocol: c.protocol,
                port: c.port,
                brokerCount: c.brokerCount,
                status: c.status,
              })
            })
          }
        })
      }

      connectorList.value = list
      // 默认选中第一个并加载 Broker 分布
      if (list.length > 0 && !selectedConnector.value) {
        selectedConnector.value = list[0]
        fetchBrokerList(list[0].connectorId)
      }
    } catch {
      connectorList.value = []
    } finally {
      connectionLoading.value = false
    }
  }

  async function fetchBrokerList(connectorId: string) {
    brokerLoading.value = true
    try {
      const res = await connectorsDistribution(connectorId)
      const data: any = (res.data as any)?.instances
      if (Array.isArray(data)) {
        brokerList.value = data
        brokerTotal.value = data.length
      } else if (data?.records) {
        brokerList.value = data.records
        brokerTotal.value = data.total || 0
      } else {
        brokerList.value = []
        brokerTotal.value = 0
      }
    } catch {
      brokerList.value = []
      brokerTotal.value = 0
    } finally {
      brokerLoading.value = false
    }
  }

  function selectConnector(connector: ConnectorItem) {
    selectedConnector.value = connector
    fetchBrokerList(connector.connectorId)
  }

  return {
    connectorList: readonly(connectorList),
    connectionLoading: readonly(connectionLoading),
    selectedConnector: readonly(selectedConnector),
    brokerList,
    brokerTotal: readonly(brokerTotal),
    brokerLoading: readonly(brokerLoading),
    fetchList,
    fetchBrokerList,
    selectConnector,
  }
}
