export function buildNoTraining(): HTMLDivElement {
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

function getIndividualStorageKey(headingDiv: HTMLElement) {
    return getPageTime(headingDiv).getTime() + "-" + getPageActivityType(headingDiv).toLowerCase()
};

function getPageTime(headingDiv: HTMLElement): Date {
    const timeElement = headingDiv.querySelector("div div.row div.spans8 div.details-container div.details time") as HTMLTimeElement;
    const timeValues = timeElement.textContent!.split(",");
    const monthDayValues = timeValues[1].trim().split(" ");
    const activityTime = new Date(timeValues[2].trim() + "-" + monthDayValues[1] + "-" + monthDayValues[0].toLowerCase() + "T00:00:00Z");
    return activityTime;
};

function getAthleteId(headingDiv: HTMLElement): String {
    const headerSpan = headingDiv.querySelector("header h2 span.title") as HTMLSpanElement;  
    return (headerSpan.querySelector("a.minimal") as HTMLLinkElement).href.split("/").pop()!;
};

function getPageActivityType(headingDiv: HTMLElement): String {
    const headerSpan = headingDiv.querySelector("header h2 span.title") as HTMLSpanElement;
    let activityType = headerSpan.innerText.split(" ").pop();
    if (!activityType) {
        activityType = "run";
    }
    return activityType.toLowerCase();
};

export function buildActivityView(planData:any, planOptions:any) {
    const headingDiv = document.getElementById('heading');
    if (headingDiv != null && planData.data && planOptions.athleteId === Number(getAthleteId(headingDiv))) {
        const pageTime = getPageTime(headingDiv).getTime();
        const dataKey = pageTime + "-" + getPageActivityType(headingDiv);
        const currentData = planData.data[dataKey];
        let newUI:HTMLDivElement;
        if (currentData) {
            newUI = updateView(headingDiv, currentData, planOptions.useMi);
        } else if (planData.startTraing.getTime() <= pageTime && planData.endTraining >= pageTime) {
            newUI = buildNoTraining();
        } else {
            return;
        }
        const childHeadingDiv:ChildNode = headingDiv.childNodes[3];
        childHeadingDiv.appendChild(newUI);
    }
}

function updateView(headingDiv:HTMLElement, currentData:any, useMi:boolean=true): HTMLDivElement {
    const newDiv:HTMLDivElement = document.createElement('div');

    let unit = "kilometer";
    let shortUnit = "km";
    if (useMi) {
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
