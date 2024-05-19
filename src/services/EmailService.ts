import { mailgunClient } from "@src/util/mailgun"
import { IMailgunClient } from "mailgun.js/Interfaces"

export class EmailService {
  private mailgunClient: IMailgunClient
  private mailgunDomain: string
  private adminEmail: string

  public constructor(options: {
    mailgunClient: IMailgunClient
    mailgunDomain: string
    adminEmail: string
  }) {
    this.mailgunClient = options.mailgunClient
    this.mailgunDomain = options.mailgunDomain
    this.adminEmail = options.adminEmail
  }

  public static fromVars(options: {
    mailgunDomain: string
    mailgunKey: string
    adminEmail: string
  }): EmailService {
    return new EmailService({
      mailgunClient: mailgunClient(options.mailgunKey),
      mailgunDomain: options.mailgunDomain,
      adminEmail: options.adminEmail,
    })
  }

  public async sendContact(options: { message: string; from: string }) {
    console.log("xxåå!!!")
    // send email to person contacting me
    const result = await this.mailgunClient.messages.create(
      this.mailgunDomain,
      {
        from: `Website User <mailgun@${this.mailgunDomain}>`,
        to: [options.from],
        subject: "Thanks for getting in touch!",
        html: "Thanks for getting in touch, I'll be sure to get back to you as soon as possible.",
      },
    )
    console.log("???")

    // console.log(result)

    // send email to admin
    this.mailgunClient.messages.create(this.mailgunDomain, {
      from: `Website User <mailgun@${this.mailgunDomain}>`,
      to: [this.adminEmail],
      subject: `Message from '${options.from}'`,
      text: options.message,
    })
  }
}
