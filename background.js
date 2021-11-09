chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'notify',
    title: "Azure Translate: %s",
    contexts: ["selection"]
  });
});

function handleErrors(response) {
  if (!response.ok) {
    throw response.statusText;
  }
  return response;
}

function replaceSelectedText(replacementText) {
  var sel, range;
  if (window.getSelection) {
      sel = window.getSelection();
      if (sel.rangeCount) {
          range = sel.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(replacementText));
      }
  } else if (document.selection && document.selection.createRange) {
      range = document.selection.createRange();
      range.text = replacementText;
  }
}

chrome.contextMenus.onClicked.addListener((info, tab) => {

  //get the selection
  let selection = info.selectionText;

  //translate the selection with Azure Translate
  let endpoint = "https://api.cognitive.microsofttranslator.com/"
  let url = `${endpoint}translate?api-version=3.0&to=de&from=en`;
  let key = "a087f5507eda41da8b722fefc35561b1"
  let region = "westeurope"

  //send the request
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': key,
      'Ocp-Apim-Subscription-Region': region,
    },
    body: JSON.stringify(
      [{ "Text": selection }]
    )
  })
    .then(handleErrors)
    .then(response => response.json())
    .then(data => {
      //send translations to alert
      chrome.scripting.executeScript({
        target: {
          tabId: tab.id,
        },
        func: replaceSelectedText,
        args: [data[0].translations[0].text],
      }
      );
    });
});