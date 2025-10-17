export class CustomLoadingScreen {
    constructor(loadingDivId, loadingUIText, hideLoadingUIWithEngine = true, customInnerHtml = null, customInnerCss = null) {
        this.loadingDivId = loadingDivId;
        this.loadingUIText = loadingUIText;
        this.hideLoadingUIWithEngine = hideLoadingUIWithEngine;
        this.customInnerHtml = customInnerHtml;
        this.customInnerCss = customInnerCss;
        this.loadingUIBackgroundColor = "#000000";
        if (this.loadingDivId == null || this.loadingDivId === "") {
            this.loadingDivId = "customLoadingScreen";
        }
        if (this.loadingUIText == null || this.loadingUIText === "") {
            this.loadingUIText = "Please Wait";
        }
    }
    displayLoadingUI() {
        if (this.hasLoadingDiv()) {
            this.showLoadingDiv(true);
            return;
        }
        const defaultLoadingScreenCss = "";
        const customLoadingScreenCss = document.createElement("style");
        customLoadingScreenCss.type = "text/css";
        customLoadingScreenCss.innerHTML = (this.customInnerCss || defaultLoadingScreenCss);
        document.getElementsByTagName("head")[0].appendChild(customLoadingScreenCss);
        const defaultLoadingScreenDiv = this.loadingUIText;
        const customLoadingScreenDiv = document.createElement("div");
        customLoadingScreenDiv.id = this.loadingDivId;
        customLoadingScreenDiv.innerHTML = (this.customInnerHtml || defaultLoadingScreenDiv);
        document.body.appendChild(customLoadingScreenDiv);
    }
    hideLoadingUI() {
        if (this.hideLoadingUIWithEngine === true) {
            this.showLoadingDiv(false);
        }
    }
    showLoadingDiv(show) {
        const loadingDiv = this.getLoadingDiv();
        if (loadingDiv != null)
            loadingDiv.style.display = (show) ? "initial" : "none";
    }
    getLoadingDiv() {
        return document.getElementById(this.loadingDivId);
    }
    hasLoadingDiv() {
        return (document.getElementById(this.loadingDivId) != null);
    }
}
