export const canViewOpportunity = (opportunity, user = {}) => {
  if (!opportunity) return false;
  if (user?.userType === 'admin') return true;
  if (user?.userType === 'faculty') return Boolean(opportunity.isActive);
  return Boolean(opportunity.isActive && (!opportunity.status || opportunity.status === 'APPROVED'));
};
