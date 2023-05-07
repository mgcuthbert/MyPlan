const debugDiv = document.getElementById('debug');
function log(text: any) {
  if (debugDiv) {
    debugDiv.innerText = text;
  }
}

// PLAN URL
const planURL = document.getElementById('planURL') as HTMLInputElement;
planURL?.addEventListener('change', () => saveOptions());

// ATHLETE ID
const athleteId = document.getElementById('athleteId') as HTMLInputElement;
athleteId?.addEventListener('change', () => saveOptions());

// MEASUREMENTS
const miRadio = document.getElementById('mi') as HTMLInputElement;
miRadio.addEventListener('change', () => saveOptions());
const kmRadio = document.getElementById('km') as HTMLInputElement;
kmRadio.addEventListener('change', () => saveOptions());

function saveOptions() {
  const currentOptions = {
    athleteId: Number(athleteId.value),
    planURL: planURL.value,
    useMi: miRadio.checked,
  };
  chrome.storage.local.set({ planOptions: currentOptions });
}

chrome.storage.local.get('planOptions').then((options) => {
  const currentOptions = options.planOptions;
  if (currentOptions) {
    if (currentOptions.planURL) {
      planURL.value = currentOptions.planURL;
    }

    if (currentOptions.athleteId && currentOptions.athleteId !== 0) {
      athleteId.value = currentOptions.athleteId;
    }

    if (currentOptions.useMi) {
      miRadio.checked = true;
    } else {
      kmRadio.checked = true;
    }
  }
});
