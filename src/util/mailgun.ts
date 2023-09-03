import Mailgun from "mailgun.js"
import { IMailgunClient } from "mailgun.js/Interfaces"
import FormData from "form-data"

export function mailgunClient(key: string): IMailgunClient {
  const mailgun = new Mailgun(FormData)
  return mailgun.client({
    username: "api",
    key,
    url: "https://api.eu.mailgun.net",
  })
}
