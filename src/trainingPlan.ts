const updateDom = async (): Promise<void> => {
    const headingDiv = document.getElementById('heading');
    if (headingDiv != null) {
        chrome.runtime.sendMessage("TestTrainingPlan", handleResponse);
    } else {
        console.log("Heading Not Found, training plan could not be integrated!");
    }
};

function handleResponse(data:string) {
    chrome.storage.local.get(["planOptions"]).then((result) => {
        chrome.storage.local.get(["plan"]).then((planData) => {
            buildPlan(planData.plan, result.planOptions);
        });
    });
};

function buildPlan(planData:string, options:any) {
    const headingDiv = document.getElementById('heading');
    if (headingDiv != null) {
        // get the runner id
        const headerSpan = headingDiv.querySelector("header h2 span.title") as HTMLSpanElement;
        const athleteId = (headerSpan.querySelector("a.minimal") as HTMLLinkElement).href.split("/").pop();
        let activityType = headerSpan.innerText.split(" ").pop();
        if (!activityType) {
            activityType = "run";
        }

        console.log(activityType.toLowerCase() + " - " + options.activityTypes);

        if (options.athleteId === Number(athleteId) && (options.activityTypes as string[]).indexOf(activityType.toLowerCase()) > -1) {
            const childHeadingDiv:ChildNode = headingDiv.childNodes[3];
            // PARENT DIV
            const newDiv:HTMLDivElement = document.createElement('div');
            newDiv.className = 'border-top-light';
            newDiv.innerHTML = `<div class="no-margins row">
                <header style="display: block;" class="inset">
                    <b>TRAINING PLAN:</b>
                    ${planData}
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
