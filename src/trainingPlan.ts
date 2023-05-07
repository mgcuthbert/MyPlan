const updateDom = async (): Promise<void> => {
    const headingDiv = document.getElementById('heading');
    if (headingDiv != null) {
        // todo check the cache first and see if we can just grab it directly from the cache first
        chrome.runtime.sendMessage("TestTrainingPlan", handleResponse);
    } else {
        console.log("Heading Not Found, training plan could not be integrated!");
    }
};

function handleResponse(status:string) {
    console.log(status);
    chrome.storage.local.get(["planOptions"]).then((options) => {
        buildPlan(options.planOptions);
    });
};

function buildPlan(options:any) {
    const headingDiv = document.getElementById('heading');
    if (headingDiv != null) {
        // get the runner id
        const headerSpan = headingDiv.querySelector("header h2 span.title") as HTMLSpanElement;
        const athleteId = (headerSpan.querySelector("a.minimal") as HTMLLinkElement).href.split("/").pop();
        let activityType = headerSpan.innerText.split(" ").pop();
        if (!activityType) {
            activityType = "run";
        }
        // get the date for the activity
        const timeElement = headingDiv.querySelector("div div.row div.spans8 div.details-container div.details time") as HTMLTimeElement;
        const activityTime = new Date(timeElement.dateTime);
        const storageKey = "TestTrainingPlan-" + activityTime.getTime() + "-" + activityType;
        chrome.storage.local.get([storageKey]).then((planData) => {
            console.log(planData);
        });

        if (options.athleteId === Number(athleteId) && (options.activityTypes as string[]).indexOf(activityType.toLowerCase()) > -1) {
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
} 

updateDom();
