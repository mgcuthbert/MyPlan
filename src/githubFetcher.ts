chrome.runtime.onMessage.addListener((planName, sender, sendResponse) => {
    const planURL = 'https://raw.githubusercontent.com/mgcuthbert/TestRepo/main/' + planName + '.csv';
    console.log("Grabbing " + planName + "from github here: " + planURL);
    const data = fetch(planURL, {
        mode: "cors",
        cache: "force-cache"
    }).then((data) => data.text())
    .then((data) => {
        sendResponse(data);
        console.log(data);
    })
    .catch((error) => console.error(error));
});