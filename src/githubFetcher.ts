chrome.runtime.onMessage.addListener((planName, sender, sendResponse) => {
    console.log("Received message for " + planName);
    chrome.storage.local.get(["planOptions"], (options) => {
        if (options.planOptions.planURL && options.planOptions.planURL.length > 0) {
            chrome.storage.local.get([planName], (currentPlan) => {
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

function updateLocalStorageWithPlan(planName:string, data:any): Promise<void> {
    // Create a map of all the training entries, and then cache it based on the plan name
    const trainingMap: Record<string,any> = {};
    data.split(/\r?\n/).forEach((element:string) => {
        if (element && element.length > 0) {
            const planElements = element.split(",");
            const entityDate = new Date(planElements[0] + "T00:00:00Z");
            const entityType = planElements[1];
            const distance = Number(planElements[2]);
            const pace = planElements[3].split(":");
            const paceMinutes = Number(pace[0]);
            const paceSeconds = Number(pace[1]);
            const totalMinutes = distance * paceMinutes;
            const totalSeconds = distance * paceSeconds;
            const addedMinutes = Math.trunc(totalSeconds / 60);
            const finalHours = Math.trunc((totalMinutes + addedMinutes) / 60);
            const finalMinutes = Math.trunc((totalMinutes + addedMinutes) % 60);
            const finalSeconds = Math.trunc(totalSeconds % 60);
            const newEntity = {
                date: entityDate.getTime(),
                distance: distance,
                paceMinutes: paceMinutes,
                paceSeconds: paceSeconds,
                hours: finalHours,
                minutes: finalMinutes,
                seconds: finalSeconds,
                type: entityType,
                title: planElements[4],
                description: planElements[5]
            }
            const storageKey = entityDate.getTime() + '-' + entityType.toLowerCase();
            trainingMap[storageKey] = newEntity;
        }
    });
    return chrome.storage.local.set({[planName]: { data: trainingMap, tombstone: Date.now() }});
}