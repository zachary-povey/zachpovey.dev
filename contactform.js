

export function createContactForm(menu) {
    menu.hide()
    const container = document.createElement("div")
    container.classList.add("contact-form")
    menu.parentElement.append(container)

    const title = document.createElement("h1")
    title.classList.add("contact-form-title")
    title.innerHTML = "Send me a message!"
    const message = document.createElement("textarea")
    message.classList.add("contact-form-message")
    message.setAttribute("placeholder", "I'd like to give you loads of money...")

    const replyTo = document.createElement("input")
    replyTo.classList.add("contact-form-reply-to")
    replyTo.setAttribute("type", "email")
    replyTo.setAttribute("placeholder", "Your email address")


    const button = document.createElement("button")
    button.classList.add("contact-form-send")

    const children = [title, message, replyTo, button]

    button.addEventListener("click", () => {
        button.style = '--image: url("artwork/images/ui/send_button_half_pressed.png")'
        setTimeout(() => {
            button.style = '--image: url("artwork/images/ui/send_button_pressed.png")'
            setTimeout(() => {
                button.style = '--image: url("artwork/images/ui/send_button_half_pressed.png")'
                setTimeout(() => {
                    button.style = '--image: url("artwork/images/ui/send_button.png")'
                    setTimeout(() => {
                        for (const child of children) {
                            child.remove()
                        }
                        const title = document.createElement("h1")
                        title.classList.add("contact-form-title")
                        title.innerHTML = "Message received!\n The uh... 'real' me will be in touch soon."
                        container.appendChild(title)
                        setTimeout(() => {
                            container.remove()
                            menu.activate()
                        }, 3000)
                    }, 100)
                }, 100)
            }, 100)
        }, 100)


    })



    for (const child of children) {
        container.appendChild(child)
    }



    //  deactivate menu
    // create input text box
    // create button
    // on button click: 
    // - send email
    // - activate menu
}