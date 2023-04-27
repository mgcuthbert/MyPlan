chrome.runtime.onMessage.addListener((planName, sender, sendResponse) => {
    chrome.storage.local.get(["options"]).then((options) => {
        if (options.planURL && options.planURL.length > 0) {
            chrome.storage.local.get(["trainingPlan"]).then((currentPlan) => {
                if (currentPlan && currentPlan.url === options.planURL && Date.now() - currentPlan.tombstone < 86400000) {
                    sendResponse("Using current plan from cache. URL: " + options.planURL);
                } else {
                    fetch(options.planURL, {
                        mode: "cors",
                        cache: "no-cache",
                    }).then((data) => data.text())
                    .then((data) => {
                        updateLocalStorageWithPlan(options.planURL, data)
                        .then(() => sendResponse("Fetching training plan from URL: " + options.planURL));
                    })
                    .catch((error) => console.error(error));
                }
            });
        }
    });
});

function updateLocalStorageWithPlan(planURL:string, data:any): Promise<void> {
    return chrome.storage.local.set({'trainingPlan': {
        trainingPlan: data,
        url: planURL,
        tombstone: Date.now(),
    }});
}