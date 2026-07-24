import JSEncrypt from 'jsencrypt'
// 密钥对生成 http://web.chacuo.net/netrsakeypair
const publicKey =
  'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDWRjkfN/NdqfPJ0/R9IQZHfegXuUBlwmjB5e1fAHo+bXvodl+09ky++WXfqelZvAxW+uu5QSbQVKObi0otOUWdv8el63EqGGQ+xwrDdN/877z8fjhh736u2Z5wsJDfp6ZS+wGtLU/duxYgUZh+uWR07Lq7t6DkGL1A32Ce+bT81wIDAQAB'
// 注意：RSA 解密应在后端进行，前端仅持有公钥用于加密传输
// 密钥对生成 http://web.chacuo.net/netrsakeypair

// 加密
export function encrypt(txt: string) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey) // 设置公钥
  return encryptor.encrypt(txt) // 对数据进行加密
}