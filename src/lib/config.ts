export const CONFIG = {
  DELCOM_BASEURL:
    process.env.NEXT_PUBLIC_DELCOM_BASEURL || "https://open-api.delcom.org/api/v1",
  APP_PORT: parseInt(process.env.APP_PORT || "3000", 10),
};
