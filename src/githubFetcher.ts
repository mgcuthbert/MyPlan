chrome.runtime.onMessage.addListener(async (planName, sender, sendResponse) => {
    const planURL = 'https://raw.githubusercontent.com/mgcuthbert/TestRepo/main/' + planName + '.csv';
    console.log("Grabbing " + planName + "from github here: " + planURL);
    const data = await fetch(planURL, {
        mode: "cors",
        cache: "force-cache"
    }).then((data) => data.text())
    .then((data) => {
        sendResponse(data);
        updateLocalStorageWithPlan(data);
    })
    .catch((error) => console.error(error));
});

function updateLocalStorageWithPlan(data:any) {
    chrome.storage.local.set({'plan': data});
}