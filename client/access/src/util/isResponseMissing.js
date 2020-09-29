import _ from "lodash";

export default function isResponseMissing(survey, responses) {
  let responseMissing = false;
  survey.forEach((section) => {
    _.values(section).find((questionKeys) => {
      return questionKeys.forEach((questionKey) => {
        if (!(questionKey in responses)) {
          responseMissing = true;
        }
      });
    });
  });
  return responseMissing;
}
