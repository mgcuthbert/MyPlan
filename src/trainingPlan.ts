// Some globals - yeah I know you no one likes globals.
// I am not trying to win any awards for clean code here.
let planOptions:any = undefined;
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getPageTime(headingDiv: HTMLElement): Date {
    const timeElement = headingDiv.querySelector("div div.row div.spans8 div.details-container div.details time") as HTMLTimeElement;
    const timeValues = timeElement.textContent!.split(",");
    const monthDayValues = timeValues[1].trim().split(" ");
    const activityTime = new Date(timeValues[2].trim() + "-" + monthDayValues[1] + "-" + monthDayValues[0].toLowerCase() + "T00:00:00Z");
    return activityTime;
}

function getAthleteId(headingDiv: HTMLElement): String {
    const headerSpan = headingDiv.querySelector("header h2 span.title") as HTMLSpanElement;  
    return (headerSpan.querySelector("a.minimal") as HTMLLinkElement).href.split("/").pop()!;
}

function getPageActivityType(headingDiv: HTMLElement): String {
    const headerSpan = headingDiv.querySelector("header h2 span.title") as HTMLSpanElement;
    let activityType = headerSpan.innerText.split(" ").pop();
    if (!activityType) {
        activityType = "run";
    }
    return activityType.toLowerCase();
}

function getIndividualStorageKey(headingDiv: HTMLElement) {
    return getPageTime(headingDiv).getTime() + "-" + getPageActivityType(headingDiv).toLowerCase()
}

function handleResponse(status:string) {
    console.log(status);
    chrome.storage.local.get([planOptions.planName], (planData) => {
        if (planData) {
            buildPlan(planOptions.planName, planData[planOptions.planName]);
        }
    });
};

function buildPlan(planName:string, planData:any) {
    // check which page we are on and work based on that
    if (location.href.match("activities")) {
        console.log("Updating activities page...");
        console.log("Loading Training Plan...");
        const headingDiv = document.getElementById('heading');
        if (headingDiv != null && planData.data && planOptions.athleteId === Number(getAthleteId(headingDiv))) {
            const pageTime = getPageTime(headingDiv).getTime();
            const dataKey = pageTime + "-" + getPageActivityType(headingDiv);
            const currentData = planData.data[dataKey];
            let newUI:HTMLDivElement;
            if (currentData) {
                newUI = buildTraining(planName, headingDiv, currentData);
            } else if (planData.startTraing.getTime() <= pageTime && planData.endTraining >= pageTime) {
                newUI = buildNoTraining();
            } else {
                return;
            }
            const childHeadingDiv:ChildNode = headingDiv.childNodes[3];
            childHeadingDiv.appendChild(newUI);
        }
    } else if (location.href.match("dashboard")) {
        console.log("Updating dashboard page...");
        buildComingUp(planName, planData);
    }
};

function buildComingUp(planName:string, planData:any) {
    const feedDiv = document.getElementById('dashboard-feed');
    if (feedDiv) {
        const newDiv:HTMLDivElement = document.createElement('div');
        newDiv.className = "card";
        console.log(planData);
        const filteredKeys = Object.keys(planData.data).filter((dateKey:string) => {
            const millis = dateKey.split("-")[0];
            return Number(millis) > Date.now() && Number(millis) <= Date.now() + 6.048e+8;
        }).sort();
        if (filteredKeys.length === 0) {
            var daysBetween = planData.startTraing - new Date().getTime();
            daysBetween = Math.floor(daysBetween / (1000*60*60*24));
            newDiv.innerHTML = `
            <div class="card-body text-left">
                <div class="card-section">
                    <h2 class="text-title2 mt-sm mb-md">
                        ${planName}
                    </h2>
                    Training starting in <b>${daysBetween}</b> days: <br/>
                    <b>${new Date(planData.startTraing).toDateString()}</b> through <b>${new Date(planData.endTraining).toDateString()}</b>
                </div>    
            </div>
            `;
        } else {
            let innerHTML = `
                <div class="card-body text-left">
                    <div class="card-section">
                        <h2 class="text-title2 mt-sm mb-md">
                            ${planName}
                        </h2>
                        Training for the next week.
                    </div>
            `;
            let totalDistance = 0;
            filteredKeys.forEach((key:any) => {
                const currentPlan = planData[key];
                let paceSeconds = currentPlan.paceSeconds;
                if (paceSeconds < 10) {
                    paceSeconds = "0" + paceSeconds;
                }
                totalDistance += currentPlan.distance;
                const currentDate = new Date(currentPlan.date);
                innerHTML += `
                    <div class="card-section">
                        <ul class="list-stats text-left">
                            <li>
                                <div>
                                    <b>${currentPlan.title}</b>
                                </div>
                            </li>
                            <li>
                                <div class="stat">
                                    <div class="stat-subtext text-left"><b>Day</b></div>
                                    <b class="stat-subtext">${currentDate.toLocaleDateString("en-US", { weekday: 'long'})}</b>
                                </div>
                            </li>
                            <li>
                                <div class="stat">
                                    <div class="stat-subtext text-left"><b>Distance</b></div>
                                    <b class="stat-subtext">${currentPlan.distance}</b>
                                <div class="stat">
                            </li>
                            <li>
                                <div class="stat">
                                    <div class="stat-subtext text-left"><b>Pace</b></div>
                                    <b class="stat-subtext">${currentPlan.paceMinutes + ":" + paceSeconds} / mi</b>
                                </div>
                            </li>
                            <li>
                                <div class="stat">
                                    <div class="stat-subtext text-left"><b>Description</b></div>
                                    <b class="stat-subtext">${currentPlan.description}</b>
                                </div>
                            </li>
                        </ul>
                    </div>
                `;
            });
            innerHTML += `
                    <div class="card-footer text-right">
                        A total of <b>${totalDistance}</b> miles planed for the next 7 days.    
                    </div>
                </div>
            `;
            newDiv.innerHTML = innerHTML;
        }
        newDiv.style["marginTop"] = "20px";
        feedDiv.insertBefore(newDiv, feedDiv.firstChild);
    }
}

function buildNoTraining(): HTMLDivElement {
    const newDiv:HTMLDivElement = document.createElement('div');
    newDiv.className = 'border-top-light';
    newDiv.innerHTML = `<div class="no-margins row">
        <header style="display: block; color: red" class="inset">
            <b>TRAINING PLAN:</b> No Training today, this should have been a rest day. Be careful to not overtrain!
        </header>
    <div/>
    `;
    return newDiv;
};

function buildTraining(planName:string, headingDiv:HTMLElement, currentData:any): HTMLDivElement {
    const newDiv:HTMLDivElement = document.createElement('div');

    let unit = "kilometer";
    let shortUnit = "km";
    if (planOptions.useMi) {
        unit = "mile"
        shortUnit = "mi";
    }

    const pageDistance = headingDiv.querySelector("div div.row div.spans8.activity-stats ul.inline-stats.section li strong") as HTMLElement;
    let distanceDifference = Number((currentData.distance - Number(pageDistance.innerText.split(" ")[0].trim())).toFixed(2));
    let distanceColor = 'green';
    if (distanceDifference > 0) {
        distanceColor = 'red';
    }
    distanceDifference = Math.abs(distanceDifference);

    const pagePace = (headingDiv.querySelector("div div.row div.spans8.activity-stats ul.inline-stats.section li:nth-child(3) strong") as HTMLElement).innerText.split(" ")[0].split(":");
    const pagePaceMinutes = Number(pagePace[0]);
    const pagePaceSeconds = Number(pagePace[1]);
    const paceDifferenceInSeconds = ((currentData.paceMinutes - pagePaceMinutes) * 60) + currentData.paceSeconds - pagePaceSeconds;
    let paceDifferenceMinutes = Math.floor(Math.abs(paceDifferenceInSeconds / 60));
    let paceDifferenceSeconds = Math.floor(Math.abs(paceDifferenceInSeconds % 60));
    let paceColor = 'green';
    if (paceDifferenceInSeconds < 0) {
        paceColor = 'red';
    }

    newDiv.className = 'border-top-light';
    newDiv.innerHTML = `<div class="no-margins row">
        <header style="display: block;" class="inset">
            <b>TRAINING PLAN:</b> ` + currentData.title + `
        </header>
        <div class="column">
            <div class="inset">
                <ul class="inline-stats section spans8">
                    <li>
                        <strong>` + currentData.distance + `</strong>
                        <abbr class="unit" title="` + unit + `s">` + shortUnit + `</abbr></strong>
                        <div class="label">Expected Distance</div>
                    </li>
                    <li>
                        <strong style="color: ` + distanceColor + `">` + distanceDifference + `</strong>
                        <abbr class="unit" title="` + unit + `s">` + shortUnit + `</abbr></strong>
                        <div class="label">Distance Difference</div>
                    </li>
                    <li>
                        <strong>` + currentData.paceMinutes + `:` + currentData.paceSeconds + `</strong>
                        <abbr class="unit" title="minutes per ` + unit + `">/` + shortUnit + `</abbr></strong>
                        <div class="label">Expected Pace</div>
                    </li>
                    <li>
                        <strong style="color:` + paceColor + `">` + paceDifferenceMinutes + `:` + paceDifferenceSeconds + `</strong>
                        <abbr class="unit" title="minutes per ` + unit + `">/` + shortUnit + `</abbr></strong>
                        <div class="label">Pace Difference</div>
                    </li>
                </ul>
            </div>
        </div>
        <div class="column">
        <i>` + currentData.description + `</i>
        </div>
    <div/>
    `;

    return newDiv;
};

const updateDom = async (): Promise<void> => {
    chrome.storage.local.get('planOptions', (options) => {
        planOptions = options.planOptions;
        chrome.storage.local.get([planOptions.planName], (planData) => {
            if (planData && Date.now() - planData.tombstone < 86400000) {
                buildPlan(planOptions.planName, planData[planOptions.planName]);
            } else {
                chrome.runtime.sendMessage(planOptions.planName, handleResponse);
            }
        });
    });
};

updateDom();
