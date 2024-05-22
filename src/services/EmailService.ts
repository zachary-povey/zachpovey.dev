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
    const fromDomain = this.mailgunDomain.split(".").slice(-2).join(".")
    // send email to person contacting me
    const confirmationEmail = this.mailgunClient.messages.create(
      this.mailgunDomain,
      {
        from: `Zach Povey <zach@${fromDomain}>`,
        to: [options.from],
        subject: "Thanks for getting in touch!",
        html: "Thanks for getting in touch, I'll be sure to get back to you as soon as possible.",
      },
    )

    // send email to admin
    const contactEmail = this.mailgunClient.messages.create(
      this.mailgunDomain,
      {
        from: `Website User <noreply@${fromDomain}>`,
        to: [this.adminEmail],
        subject: `Message from '${options.from}'`,
        text: options.message,
      },
    )

    const [confirmationResult, contactResult] = await Promise.allSettled([
      confirmationEmail,
      contactEmail,
    ])

    // const confirmationResult = await confirmationEmail
    if (confirmationResult.status == "rejected") {
      throw Error(
        `Failed to send confirmation email to ${options.from}:\n${confirmationResult.reason}`,
      )
    }

    // const contactResult = await contactEmail
    if (contactResult.status == "rejected") {
      throw Error(
        `Failed to send contact email from ${options.from}:\n${contactResult.reason}`,
      )
    }
  }
}
