let findEmails = document.getElementById('findEmails');
let list = document.getElementById('emailList');
let uniqueEmails = new Set(); // Store unique emails

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    let emails = request.emails;

    if (emails == null || emails.length === 0) {
        let li = document.createElement('li');
        li.innerHTML = "No emails found";
        list.appendChild(li);
    } else {
        emails.forEach((email) => {
            uniqueEmails.add(email); // Add email to the Set to ensure uniqueness
        });

        // Clear the list before adding unique emails
        list.innerHTML = '';

        uniqueEmails.forEach((email) => {
            let li = document.createElement('li');
            li.innerHTML = `
                <span>${email}</span>
                <span class="copy-icon">&#128203;</span>
                <span class="checkmark-icon">&#10003;</span>`;
            list.appendChild(li);

            let copyIcon = li.querySelector('.copy-icon');
            let checkmarkIcon = li.querySelector('.checkmark-icon');
            copyIcon.addEventListener('click', () => {
                // Copy the email to the clipboard
                const textArea = document.createElement('textarea');
                textArea.value = email;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);

                // Hide the copy icon and show the checkmark icon
                copyIcon.style.display = 'none';
                checkmarkIcon.style.display = 'inline';
            });
        });
    }
});

findEmails.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: findEmailsFromPage,
    });
});

function findEmailsFromPage() {
    const emailRegex = /[\w\.=-]+@[\w\.-]+\.[\w]{2,3}/gim;

    let emails = document.body.innerHTML.match(emailRegex);

    chrome.runtime.sendMessage({ emails });
}
