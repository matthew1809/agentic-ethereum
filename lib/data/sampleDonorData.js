export const sampleDonorData = [
  {
    _id: "d1f41107-5918-467c-95c7-396a71bfe111",
    donor_info: {
      name: { $share: 'John Smith' },
      amount: { $share: 1000 }
    },
    recurring: true,
    duration_months: 12
  },
  {
    _id: "d2f41250-e509-4833-98f3-387389257222",
    donor_info: {
      name: { $share: 'Alice Johnson' },
      amount: { $share: 500 }
    },
    recurring: false,
    duration_months: 0
  },
  {
    _id: "d3f52361-f610-4944-09f4-498490368333",
    donor_info: {
      name: { $share: 'Bob Wilson' },
      amount: { $share: 2000 }
    },
    recurring: true,
    duration_months: 6
  }
]; 