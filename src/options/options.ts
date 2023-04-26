const planURL = document.getElementById('planURL') as HTMLInputElement;
chrome.storage.local.get('planURL', (result) => {
  const value = result.planURL;
  if (planURL) {
    planURL.value = value;
  } else {
    throw new Error('PlanURL text input not found!');
  }
});

planURL?.addEventListener('change', () => {
  chrome.storage.local.set({
    planURL: planURL.value,
  })
});

const miRadio = document.getElementById('mi') as HTMLInputElement;
const kmRadio = document.getElementById('km') as HTMLInputElement;

// update UI on startup
chrome.storage.local.get('useMi', (result) => {
  if (result.useMi) {
    miRadio.checked = true;
    kmRadio.checked = false;
  } else {
    kmRadio.checked = true;
    miRadio.checked = false;
  }
});

miRadio.addEventListener('change', () => setMeasurementStorage());
kmRadio.addEventListener('change', () => setMeasurementStorage());

function setMeasurementStorage() {
  if (miRadio.checked) {
    chrome.storage.local.set({useMi: true});
  } else {
    chrome.storage.local.set({useMi: false});
  }
};

// update UI when storage changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.useMi) {
    if (changes.useMi) {
      miRadio.checked = true;
      kmRadio.checked = false;
    } else {
      kmRadio.checked = true;
      miRadio.checked = false;
    }
  }
})