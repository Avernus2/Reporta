import axios from "axios";

const databaseURL = "https://reportalo-5bf74-default-rtdb.firebaseio.com/";

export const sendReport = async (reportData) => {
  try {
    const response = await axios.post(
      databaseURL + "/reports.json",
      reportData
    );

    const reportId = response.data.name;

    return { success: true, reportId };
  } catch (error) {
    console.error("Error al enviar el reporte:", error);

    return { success: false, error };
  }
};

export const getData = async () => {
  try {
    const response = await axios.get(`${databaseURL}/reports.json`);
    const data = response.data;

    const reports = [];
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        reports.push({
          id: key,
          ...data[key],
        });
      }
    }

    return { success: true, reports };
  } catch (error) {
    console.error("Error al obtener los datos:", error);
    return { success: false, error };
  }
};
