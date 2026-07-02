export const CAR_RENTAL = {
  company: 'Budget',
  office: 'Waverley Train Station',
  address: 'Q-Park Greenside Row, Level -2 Multistorey Car Park, Edinburgh, EH1 3AN, United Kingdom',
  phone: '0844 544 6061',
  pickup: {
    dayNumber: 3,
    date: '2026-07-07',
    time: '08:00',
  },
  return: {
    dayNumber: 7,
    date: '2026-07-11',
    time: '19:00',
  },
  vehicle: 'Cotxe mitjà · grup MA (p. ex. Kia Sportage)',
  coverage: 'Cobertura estàndard',
  price: '255,70 €',
}

export function carRentalDirections() {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(CAR_RENTAL.address)}&travelmode=driving`
}
