// source: https://www.redcrossblood.org/donate-blood/blood-types.html
const bloodCompatibilityInfo = {
  // Key: Recipient (Patient Needs), Value: [Compatible Donors]
  "O-": ["O-"],
  "O+": ["O+", "O-"],
  "A-": ["A-", "O-"],
  "A+": ["A+", "A-", "O+", "O-"],
  "B-": ["B-", "O-"],
  "B+": ["B+", "B-", "O+", "O-"],
  "AB-": ["AB-", "A-", "B-", "O-"],
  "AB+": ["AB+", "AB-", "A+", "A-", "B+", "B-", "O+", "O-"],
};

/**
 * Returns an array of blood groups that can donate to the specified patient blood group.
 * @param {string} patientBloodGroup - The blood group needed by the patient.
 * @returns {string[]} Array of compatible donor blood groups.
 */
exports.getCompatibleDonorBloodGroups = (patientBloodGroup) => {
  return bloodCompatibilityInfo[patientBloodGroup] || [];
};
