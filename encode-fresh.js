const key = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCtN3ENh/vwVKpn
j9gWlFMnNndKcijy8TJ6BN3m2Y+zPldQ2U+AVw+QfPJPtGU0TPJbvDWkqi6ynBsq
WRHcyBvmgyPcFp5L4LVUl69de49AkzWK6OryFqNuE0yrj3Lo6Zrcm8pCUtIyMZSp
NUPn5+jQoyRs98sS2Mf+YufRzwYzbG7Smbs36emkWUNOnpr4DoSx7XHiwAHaTvbH
DXeEIYPapGXMogGn99D9qlvBWWcUBAQz3fLWvyx0ZLgUSpRK3vQtxSaqKCSl60hh
ng872xGDZZjeIM4omnXBozijcAS0+hzb6/Pqmpkcwpby27AiFNb1ykuBczMsDbdX
K20Tn/yTAgMBAAECggEAGgRHRzyDA1R8KcTptG5/1NZx8W0XKHJA3iHoAHnyAv6c
l8ikD8dDz7RsorsaLlJWXp/0wLBNBke7Ls+lBq/JvQQ6eR6ulQABzFxiGxzpZc4W
jzAvxb/PuUNN00DfBgu8VmFR7kdJSf+3b/jPo7/p8JhoarOHPWPxGgzZ++Hn8QYb
UZXC/mwsYTuPuIioU7HJsHQVv4CubVPtKmLzT+5TccI8gH0D2bt7Yr3tURd+cnbm
ibSxAY8NqoP5EI2qJ8IrsXsxhK2GTX8Q+xNW3o1rwa2Syrznr0ylu78Pry+OvC07
MWnviGC5lXm7laeb1Xq1BJfE9W9rFA8gfHLgbzgxfQKBgQDnBdZu2BJj+OfLrAbN
fdjEkxteF+gqAfrrmrQY3rgpgHqOFF+gYVIuXzKXI06u7vOQ63X4zqDNWx5bvlkY
0aleecki0kTcbfBeR+eAUF1UeVM5Mn1c9kARigVHDDAjZOfP8b6eSlBcq0Xx+YI+
OkQXjd3ypFXaLGqPLPKi0fuYjwKBgQC/8aosa4PCOr5OZgab8BjEyEnE8yflARxw
2j3wrbeZKCxbyl9rxr+3mdFFBsbrA/y//NzivGXOkB+OX11n7mNvt0Omvdc3Iatm
C9EqNecVtSnOixKSd6PfmObKiO0nZUSgnVKx52LuRiamk42M31yxBCp2qZW/Ku8E
pn/5aul1vQKBgD5iHCpoXGb0kps0A84/mmZSlwRMjluxlzFB4DoLAk3qrK1rIPts
7EUrXbzkQt4IFmteuceK/G8XmNYLS4HhM8wYNNEbWI7xfQPohMHocZta+7cpRCLz
OA/EZnJt/x2/pL1JOUEDLjon4cZaqunkz/hQTcu0xp4YelnZOFfxPfBPAoGBAIHa
i2cLwZK4TSEa0uPSNd+DJK0SV24NJ2GNtBPMYoZB8GiU66MtTWx3qmUJZa9+/hIg
joryK+noBQE7sSRr2Wet0x3OFvhcVelumy30U4aTDlqGKaVfPUU62wAwTEi3sQr8
BAMJaBuM5/8PmdaxEbNL/zJSHlW7RQKfZbqmQpT9AoGBAIgKCaVgu2rxJnksyHe2
ukeaRQsEFX1dknikYkNvX0zZnSoATQc/Q0sI71QFcwaQjhg7hxvz95cYj728J9T+
ef7FsgyTuSBcaMRwq3ndlxJEsWUfwN9Wq5x5CV4ldykGYzd3DlUPcBnR1W3Y4V/k
gFz5gK+07qoZXkbCBPVLt9WW
-----END PRIVATE KEY-----
`;

const creds = {
  type: "service_account",
  project_id: "nfsu-projects-system",
  private_key: key,
  client_email: "nfsu-sheets-access@nfsu-projects-system.iam.gserviceaccount.com"
};

const base64 = Buffer.from(JSON.stringify(creds)).toString('base64');
console.log('\n=== COPY THIS TO VERCEL ===\n');
console.log(base64);
console.log('\n=== Length:', base64.length, '===\n');
