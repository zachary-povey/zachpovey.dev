

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


    const sendButton = document.createElement("button")
    sendButton.classList.add("contact-form-send")

    const backButton = document.createElement("button")
    backButton.classList.add("contact-form-back")

    const children = [title, message, replyTo, sendButton, backButton]

    for (const child of children) {
        container.appendChild(child)
    }

    backButton.addEventListener("click", () => {
        pressButton(
            {
                button: backButton,
                buttonName: "back_button",
                callback: () => {
                    setTimeout(() => {
                        container.remove()
                        menu.activate()
                    }, 100)
                }
            }
        )
    })

    sendButton.addEventListener("click", () => {
        fetch("/api/contact", {
            method: "POST",
            body: JSON.stringify({ message: message.value, from: replyTo.value }),
            headers: {
                "Content-Type": "application/json",
            },
        })
        pressButton(
            {
                button: sendButton,
                buttonName: "send_button",
                callback: () => {
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
                }
            }
        )
    })
}

function pressButton({ button, buttonName, callback }) {
    transition(
        {
            element: button,
            styles: [
                `--image: url("../cv_island/artwork/images/ui/${buttonName}_half_pressed.png")`,
                `--image: url("../cv_island/artwork/images/ui/${buttonName}_pressed.png")`,
                `--image: url("../cv_island/artwork/images/ui/${buttonName}_half_pressed.png")`,
                `--image: url("../cv_island/artwork/images/ui/${buttonName}.png")`,
            ],
            wait_ms: 100,
            then: callback
        }
    )
}

function transition({ element, styles, wait_ms, then }) {
    if (styles.length == 0) {
        then()
        return
    }
    setTimeout(
        () => {
            element.style = styles[0]
            transition({
                element,
                styles: styles.slice(1),
                wait_ms,
                then,
            })
        },
        wait_ms
    )
}