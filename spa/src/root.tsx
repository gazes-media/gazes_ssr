import { createRoot } from "react-dom/client";
import '@mantine/core/styles.css';
import '@mantine/carousel/styles.css';
import App from "./App";
import { analytics } from "./utils/database";
import { setAnalyticsCollectionEnabled } from "firebase/analytics";
let applicationId= "CC1AD845";
  let trynum =0;

const initializeCastApi = function() {
  trynum += 1;
  if(trynum <= 5){
  if(window.cast){
    window.cast.framework.CastContext.getInstance().setOptions({
      receiverApplicationId: applicationId,
      autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
    });
    console.log('CastContext set');
  }else{
    setTimeout(initializeCastApi, 1000);
  }
}
};


initializeCastApi();
setAnalyticsCollectionEnabled(analytics, true);

createRoot(document.getElementById("root") as HTMLElement).render(
      <App />
);
