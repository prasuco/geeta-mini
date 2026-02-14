export const welcomeEmail = (name: string) => {

    return `<!doctype html>
<html>
  <body>
    <div
      style='background-color:#F2F5F7;color:#242424;font-family:"Helvetica Neue", "Arial Nova", "Nimbus Sans", Arial, sans-serif;font-size:16px;font-weight:400;letter-spacing:0.15008px;line-height:1.5;margin:0;padding:32px 0;min-height:100%;width:100%'
    >
      <table
        align="center"
        width="100%"
        style="margin:0 auto;max-width:600px;background-color:#FFFFFF"
        role="presentation"
        cellspacing="0"
        cellpadding="0"
        border="0"
      >
        <tbody>
          <tr style="width:100%">
            <td>
              <h3
                style='color:#FAFAFA;background-color:#2563EB;font-weight:bold;text-align:center;margin:0;font-family:Bahnschrift, "DIN Alternate", "Franklin Gothic Medium", "Nimbus Sans Narrow", sans-serif-condensed, sans-serif;font-size:20px;padding:16px 24px 16px 24px'
              >
                Geeta in Mail
              </h3>
              <div style="padding:16px 0px 16px 0px">
                <hr
                  style="width:100%;border:none;border-top:1px solid #CCCCCC;margin:0"
                />
              </div>
              <div style="font-weight:normal;padding:0px 24px 16px 24px">
                Hi ${name}👋,
              </div>
              <div style="font-weight:normal;padding:0px 24px 16px 24px">
                <p>
                  Thank you for choosing <strong>geeta in mail</strong>. We are
                  currently building our mvp.
                </p>
                <p>but....</p>
                <p>
                  you&#39;ll receive a demo of geeta insight shortly in your
                  mail.<br />so, hang tight...
                </p>
              </div>
              <div style="font-weight:normal;padding:16px 24px 16px 24px">
                <p>
                  If you ever need help, just reply to this email and i will get
                  back to you shortly. I&#39;m here to help.
                </p>
                <p>Regards,<br />Prabin Subedi</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </body>
</html>`

}