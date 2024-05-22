import { EmailService } from "@src/services/EmailService"
import { Request, Response } from "express"

type ContactPostRequest = {
  message: string
  from: string
}

export class ApiController {
  private emailService: EmailService

  public constructor(emailService: EmailService) {
    this.emailService = emailService
  }

  public static fromVars(options: {
    mailgunDomain: string
    mailgunKey: string
    adminEmail: string
  }): ApiController {
    const emailService = EmailService.fromVars(options)
    return new ApiController(emailService)
  }

  public async sendContact(req: Request, res: Response): Promise<undefined> {
    if (!this.isValidContactPostRequest(req.body)) {
      res
        .status(400)
        .json({
          message:
            "Invalid request, should contain 'message' and 'from' as strings.",
        })
        .send()
      return
    }
    await this.emailService.sendContact(req.body)
    res.sendStatus(200)
  }

  private isValidContactPostRequest(
    value: unknown,
  ): value is ContactPostRequest {
    return (
      typeof value === "object" &&
      value !== null &&
      "message" in value &&
      typeof value.message == "string" &&
      "from" in value &&
      typeof value.from == "string"
    )
  }
}
