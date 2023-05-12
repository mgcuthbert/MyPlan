// Some globals - yeah I know you no one likes globals.
// I am not trying to win any awards for clean code here.
let planOptions:any = undefined;

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
            buildPlan(planData[planOptions.planName].data);
        }
    });
};

function buildPlan(planData:any) {
    // check which page we are on and work based on that
    if (location.href.match("activities")) {
        console.log("Updating activities page...");
        console.log("Loading Training Plan...");
        const headingDiv = document.getElementById('heading');
        if (headingDiv != null && planData && planOptions.athleteId === Number(getAthleteId(headingDiv))) {
            const dataKey = getPageTime(headingDiv).getTime() + "-" + getPageActivityType(headingDiv);
            const currentData = planData[dataKey];
            let newUI:HTMLDivElement;
            if (currentData) {
                newUI = buildTraining(headingDiv, currentData);
            } else {
                newUI = buildNoTraining();
            }
            const childHeadingDiv:ChildNode = headingDiv.childNodes[3];
            childHeadingDiv.appendChild(newUI);
        }
    } else if (location.href.match("dashboard")) {
        console.log("Updating dashboard page...");
        buildComingUp(planData);
    }
};

function buildComingUp(planData:any) {
    const feedDiv = document.getElementById('dashboard-feed');
    if (feedDiv) {
        const newDiv:HTMLDivElement = document.createElement('div');
        newDiv.className = "card";
        const filteredKeys = Object.keys(planData).filter((dateKey:string) => {
            const millis = dateKey.split("-")[0];
            console.log(millis + "-" + Date.now() + 6.048e+8);
            return Number(millis) < Date.now() + 6.048e+8;
        });
        if (filteredKeys.length === 0) {
            newDiv.innerHTML = `
            <div class="card-body text-center">
                <div class="card-section">
                    <h2 class="text-title2 mt-sm mb-md">
                        Upcoming Training.
                    </h2>
                </div>    
            </div>
            `;
        } else {
            let innerHTML = `
                <div class="card-body text-left">
                    <div class="card-section">
                        <h2 class="text-title2 mt-sm mb-md">
                            Upcoming Training.
                        </h2>
                    </div>
            `;
            let totalDistance = 0;
            filteredKeys.forEach((key:any) => {
                const currentPlan = planData[key];
                console.log(planData[key]);
                let paceSeconds = currentPlan.paceSeconds;
                if (paceSeconds < 10) {
                    paceSeconds = "0" + paceSeconds;
                }
                totalDistance += currentPlan.distance;
                innerHTML += `
                    <div class="card-section">
                        <ul class="list-stats text-center">
                            <li>
                                <div class="stat">
                                    <div class="stat-subtext text-left">Day</div>
                                    <b class="stat-text">Friday</b>
                                </div>
                            </li>
                            <li>
                                <div class="stat">
                                    <div class="stat-subtext text-left">Distance</div>
                                    <b class="stat-text">${currentPlan.distance}</b>
                                <div class="stat">
                            </li>
                            <li>
                                <div class="stat">
                                    <div class="stat-subtext text-left">Pace</div>
                                    <b class="stat-text">${currentPlan.paceMinutes + ":" + paceSeconds} / mi</b>
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

function buildTraining(headingDiv:HTMLElement, currentData:any): HTMLDivElement {
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
                buildPlan(planData[planOptions.planName].data);
            } else {
                chrome.runtime.sendMessage(planOptions.planName, handleResponse);
            }
        });
    });
};

updateDom();
