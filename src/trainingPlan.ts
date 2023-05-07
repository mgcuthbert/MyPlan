const PLAN_NAME = "TestTrainingPlan2";

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
    return activityType;
}

function getStorageKey(headingDiv: HTMLElement) {
    return PLAN_NAME + "-" + getPageTime(headingDiv).getTime() + "-" + getPageActivityType(headingDiv).toLowerCase()
}

const updateDom = async (): Promise<void> => {
    const headingDiv = document.getElementById('heading');
    if (headingDiv != null) {
        const storageKey = getStorageKey(headingDiv);
        console.log(storageKey);
        chrome.storage.local.get([storageKey], (planData) => {
            console.log(planData);
            if (planData && planData.length > 0) {
                handleResponse("Retrieved from cache!");
            } else {
                chrome.runtime.sendMessage(PLAN_NAME, handleResponse);
            }
        });
    } else {
        console.log("Heading Not Found, training plan could not be integrated!");
    }
};

function handleResponse(status:string) {
    console.log(status);
    const headingDiv = document.getElementById('heading');
    if (headingDiv != null) {
        chrome.storage.local.get(["planOptions"], (options) => {
            const storageKey = getStorageKey(headingDiv);
            chrome.storage.local.get([storageKey], (planData) => {
                if (planData && planData.length > 0) {
                    buildPlan(options.planOptions, planData);
                }
            });
        });
    }
};

function buildPlan(options:any, planData:any) {
    const headingDiv = document.getElementById('heading');
    if (headingDiv != null && planData && options.athleteId === Number(getAthleteId(headingDiv))) {
        const childHeadingDiv:ChildNode = headingDiv.childNodes[3];
        // PARENT DIV
        const newDiv:HTMLDivElement = document.createElement('div');
        newDiv.className = 'border-top-light';
        newDiv.innerHTML = `<div class="no-margins row">
            <header style="display: block;" class="inset">
                <b>TRAINING PLAN:</b>
            </header>
            <div class="inset">
                <ul class="inline-stats section spans12">
                    <li>
                        <strong>8</strong>
                        <abbr class="unit" title="miles">mi</abbr></strong>
                        <div class="label">Expected Distance</div>
                    </li>
                    <li>
                        <strong>5</strong>
                        <abbr class="unit" title="miles">mi</abbr></strong>
                        <div class="label">Distance Difference</div>
                    </li>
                    <li>
                        <strong>8</strong>
                        <abbr class="unit" title="minutes per mile">/mi</abbr></strong>
                        <div class="label">Expected Pace</div>
                    </li>
                    <li>
                        <strong>0:45</strong>
                        <abbr class="unit" title="minutes per mile">/mi</abbr></strong>
                        <div class="label">Pace Difference</div>
                    </li>
                </ul>
            </div>
        <div/>
        `;

        childHeadingDiv.appendChild(newDiv);
    }
} 

updateDom();
