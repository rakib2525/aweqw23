export const generateTrackingLink = ({ smartlinkId, subid }) => {
  if (!smartlinkId) {
    console.error("Smartlink ID missing");
    return "";
  }

  const base = "http://localhost:5000";

  return `${base}/track/${smartlinkId}${
    subid ? `?subid=${subid}` : ""
  }`;
};