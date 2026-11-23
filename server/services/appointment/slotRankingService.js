/**
 * Slot Ranking and Selection Engine
 * Evaluates candidate appointment slots, prioritizes earliest availability,
 * and handles user preference sorting.
 */

/**
 * Sort slots chronologically in ascending order
 */
const sortSlotsAscending = (slots) => {
  return [...slots].sort((a, b) => {
    // Compare dates first (YYYY-MM-DD)
    if (a.appointmentDate !== b.appointmentDate) {
      return a.appointmentDate.localeCompare(b.appointmentDate);
    }
    // Compare times (HH:mm)
    return a.appointmentTime.localeCompare(b.appointmentTime);
  });
};

/**
 * Rank available appointment slots and select the optimal earliest matching slot
 * @param {Array} candidateSlots - Array of slot objects
 * @param {Array} rejectedSlotSignatures - Array of "doctorId_date_time" to exclude
 */
const rankAndSelectBestSlot = (candidateSlots, rejectedSlotSignatures = []) => {
  if (!candidateSlots || candidateSlots.length === 0) {
    return {
      bestSlot: null,
      rankedSlots: [],
      alternativeSlots: [],
      totalSlotsEvaluated: 0,
    };
  }

  // Filter out any slots that the user previously rejected during this session
  const validSlots = candidateSlots.filter((s) => {
    const signature = `${s.doctorId}_${s.appointmentDate}_${s.appointmentTime}`;
    return !rejectedSlotSignatures.includes(signature);
  });

  const sorted = sortSlotsAscending(validSlots);

  if (sorted.length === 0) {
    return {
      bestSlot: null,
      rankedSlots: [],
      alternativeSlots: [],
      totalSlotsEvaluated: candidateSlots.length,
    };
  }

  const bestSlot = sorted[0];
  const alternativeSlots = sorted.slice(1, 5); // Next 4 earliest alternatives

  return {
    bestSlot,
    rankedSlots: sorted,
    alternativeSlots,
    totalSlotsEvaluated: candidateSlots.length,
  };
};

module.exports = {
  sortSlotsAscending,
  rankAndSelectBestSlot,
};
