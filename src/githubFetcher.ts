chrome.runtime.onMessage.addListener((planName, sender, sendResponse) => {
    console.log("Received message for " + planName);
    chrome.storage.local.get(["planOptions"], (options) => {
        if (options.planOptions.planURL && options.planOptions.planURL.length > 0) {
            chrome.storage.local.get(["trainingPlan"], (currentPlan) => {
                if (currentPlan && currentPlan.url === options.planOptions.planURL && Date.now() - currentPlan.tombstone < 86400000) {
                    console.log("Using plan from cache.");
                    sendResponse("Using current plan from cache. URL: " + options.planOptions.planURL);
                } else {
                    console.log("Fetching plan from URL.");
                    fetch(options.planOptions.planURL, {
                        mode: "cors",
                        cache: "no-cache",
                    }).then((data) => data.text())
                    .then((data) => {
                        console.log("Plan retrieved from " + options.planOptions.planURL);
                        updateLocalStorageWithPlan(planName, data)
                        .then(() => sendResponse("Fetching training plan from URL: " + options.planOptions.planURL));
                    })
                    .catch((error) => console.error(error));
                }
            });
        }
    });
});

function updateLocalStorageWithPlan(planName:string, data:any): Promise<any[]> {
    // take the data and store it in the cache with the key "PLAN"-DATE-ACTIVITY.
    // first split each on each line in the plan, then loop through each line in 
    // the plan, split by comma and create the plan entity object
    const promises = data.split(/\r?\n/).filter((element:string) => element.length > 0)
            .map((element:string) => {
        const planElements = element.split(",");
        const entityDate = new Date(planElements[1] + "T00:00:00Z");
        const entityType = planElements[2];
        const distance = Number(planElements[3]);
        const pace = planElements[4].split(":");
        const paceMinutes = Number(pace[0]);
        const paceSeconds = Number(pace[1]);
        const totalMinutes = distance * paceMinutes;
        const totalSeconds = distance * paceSeconds;
        const addedMinutes = Math.trunc(totalSeconds / 60);
        const finalHours = Math.trunc((totalMinutes + addedMinutes) / 60);
        const finalMinutes = Math.trunc((totalMinutes + addedMinutes) % 60);
        const finalSeconds = Math.trunc(totalSeconds % 60);
        const newEntity = {
            id: planElements[0],
            date: entityDate,
            distance: distance,
            paceMinutes: paceMinutes,
            paceSeconds: paceSeconds,
            hours: finalHours,
            minutes: finalMinutes,
            seconds: finalSeconds,
            type: entityType,
            title: planElements[5],
            description: planElements[6]
        }
        const storageKey = planName + '-' + entityDate.getTime() + '-' + entityType.toLowerCase();
        console.log(storageKey);
        console.log(newEntity);
        return chrome.storage.local.set({storageKey: { newEntity }});
    });;

    return Promise.all(promises);
}