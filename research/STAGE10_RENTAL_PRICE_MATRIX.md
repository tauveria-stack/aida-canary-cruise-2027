# Етап 10 — матриця цін і повної вартості оренди

**Зріз цін:** 07.11.2026. Суми з 2026/2027 залежать від інвентарю, віку водія, класу, годин і страховки. Бронювання не створювалися.

## Відомі ціни / статус котирування

| Острів / оператор | Пункт і період пошуку | Ціна за автомобіль | Що входить / депозит / паливо | Дата-специфічна доступність | Загальна ціна для родини |
|---|---|---:|---|---|---:|
| Fuerteventura — PlusCar | FUE Airport; 07.01.2027 09:30–18:30 | **€39.95** за показаний 5-місний VW Polo manual; ще були Hyundai i10/Mitsubishi Star €35.00 (4-місні) та інші класи €39.95–46.00 | Сайт заявляє податки, comprehensive insurance, unlimited km, 2nd driver, free cancellation; same-level fuel. Депозит/блокування не оприлюднено на формі; є винятки по покриттю. Перевірений пошук за замовчуванням мав driver age 23–25 | **Форма показала інвентар на точний день** для airport search. Портове вручення/ціна для порту не підтверджені | **€39.95 + фактично спалене пальне** за airport pickup; плюс transfer. Якщо єдиний трансфер порт↔FUE: Fuerte Taxi list €20 standard (€40 round trip) або €30 MPV (€60 round trip) — орієнтовно. Airport option budget: **€79.95 + fuel** standard taxi або **€99.95 + fuel** MPV. Port handover за заявою PlusCar може усунути transfer, але підтвердження немає. Водійський вік у формі треба виставити правильно |
| Fuerteventura — CICAR Port | Puerto del Rosario port; дата 07.01, денний слот ще не підтверджений | Не встановлено | Canary terms: comprehensive/no excess, taxes, unlimited km, child seat/booster and extra driver included; fuel deposit at delivered tank level, return at same level; free change/cancel | Частина попередніх time queries = “Not available”; Jan не був доступний у date-picker 07.11. Не sold out-доказ | Не обчислюється: відсутня дата-специфічна ціна |
| Fuerteventura — TopCar Port | Muelle de Cruceros, 07.01 | Не встановлено | Excess/deposit depends on group; credit/debit card; same-to-same fuel. Port after-hours key drop unknown | Не підтверджено | Не обчислюється |
| Fuerteventura — AutoReisen / Enterprise | FUE airport | Не встановлено | AutoReisen заявляє no-excess/no-deposit/extra driver/unlimited/free cancel; Enterprise: extra driver €15/day, off-hours return, €21 refuel fee plus fuel if tank lower | Дата не перевірена | Не обчислюється без quote і transfer cost |
| Lanzarote — CICAR Port | Marina Lanzarote cruise zone, 08.01 | Не встановлено | CICAR Canary all-in cover/no excess; fuel deposit, same-level return | Не перевірено на date | Не обчислюється |
| Lanzarote — TopCar Port | Arrecife cruise port, 08.01 | Не встановлено | Credit/debit, security/excess deposit (exact amount by tariff/class), same fuel; airport return keybox does not establish port keybox | Не перевірено | Не обчислюється |
| Lanzarote — PlusCar / AutoReisen / Enterprise | ACE or claimed port delivery | Не встановлено | PlusCar claims free port/airport delivery and insurance; AutoReisen all-in terms; Enterprise requires branch fee and fuel policy | Не перевірено | Не обчислюється |
| Gran Canaria — CICAR Port | Santa Catalina, 09.01 | Не встановлено | CICAR terms above; port office has Saturday opening | Не перевірено | Не обчислюється |
| Gran Canaria — PlusCar | claimed port pickup or LPA | Не встановлено | No extra delivery is advertised; exact LPA/port availability, deposit and quoted return instructions unknown | Не перевірено | Не обчислюється |
| Gran Canaria — TopCar / Avis / Enterprise airport | LPA | Не встановлено | TopCar: LPA has 24h secure key drop; Avis: port-side listing says 24h drop-off but Saturday pickup and exact quay uncertain; Enterprise branch return terms vary | Не перевірено | Airport transfer planning estimate from Las Palmas port page: €30–35 each way; €60–70 round trip taxi, 50–60 minutes moving time, excluding waits. Not an official fixed fare and not a complete operator quote |
| Madeira — RentADrive | Funchal Cruise Port, 11.01 | No date quote | Port pickup explicitly offered as free; for 1–2 days sCDW bookings it may still apply €150 deposit; optional sCDW may avoid credit card/deposit (vehicle exceptions). 20:00–08:00 out-of-hours fee €30; return in Funchal/airport may be directed to parking | Not checked for date | Not calculable until class, cover, deposit, exact 21:30 port return confirmed |
| Madeira — Madeira Rent | Funchal city/airport; 11.01 | No date quote | Key drop after hours at designated Airport P4/Ajuda only per FAQ; pickup must be within station hours. Without credit card full cover plus €300 cash deposit. | Not checked for date | No port-transfer fare/quote |
| Madeira — Madeira Hot Wheels / Madeira Car Hire / GAR105 | Port delivery / Funchal | No date quote | Provider pages claim harbour delivery or island address delivery; no verified complete terms/pricing for this day | Not checked for date | Not calculable |
| Tenerife — existing TopCar | TFN pickup 13.01 ~11:30, TFS return 15.01 ~16:00 | Use the **existing voucher amount**, not recalculated here | Booked in project; TFS after-hours key drop is not needed for 16:00. Confirm luggage fit within booked class. Do not modify | Existing booking acknowledged in canonical project state | The exact quote/voucher is not recopied here to avoid replacing it with current web prices |
| Tenerife — CICAR / AutoReisen / PlusCar / international desks | TFN→TFS multi-day alternative | No new quote | Airport network exists; class, one-way fee, after-hours, luggage fit and date availability need checkout; TopCar current booking remains base | Not checked | Not a replacement recommendation; no full total |

## Де межа «повної ціни»

- Відомий €39.95 PlusCar result is a date-specific form total for a single vehicle, not per person; fuel is variable and excluded. The form age default was 23–25, so we should rerun with the actual driver’s age before treating it as our total.
- A company’s “insurance included” statement is an operator claim; confirm named exclusions and security hold before signing. PlusCar’s published terms exclude several damage types (e.g. wheels/tyres, underbody, roof, interior, clutch).
- No quote was read for CICAR, TopCar, AutoReisen, Enterprise, Avis or Madeira providers for the exact required date. Do not put generic “from” prices into a full family cost.
- Transfer numbers are cost estimates where explicitly identified; unverified taxi transfer is marked unknown, not zero.
- User asked for the cost of four people; car rental is charged per vehicle. A 4-seat car does not suit the four-person party if the class is actually only 4 seats; the form showed 5-seat manual VW Polo at €39.95 on the Fuerteventura search.

## Official price/terms sources

- [PlusCar live search](https://www.pluscarcanarias.com/en/home/), [Fuerteventura delivery claim](https://www.pluscarcanarias.com/fuerteventura/), [terms](https://www.pluscarcanarias.com/terminos-y-condiciones-de-alquiler/).
- [CICAR Canary rental conditions](https://www.cicar.com/EN/view/condiciones_EN).
- [TopCar hire conditions](https://top-car-hire.com/en/legal/hire-conditions/), [FAQ](https://top-car-hire.com/en/legal/frequently-asked-questions/).
- [AutoReisen Fuerteventura Airport](https://www.autoreisen.com/car-hire/fuerteventura/airport/), [Lanzarote Airport](https://www.autoreisen.com/car-hire/lanzarote/airport/).
- [Enterprise Fuerteventura Airport](https://www.enterprise.com/en/car-rental-locations/es/fuerteventura-el-matorral-airport-lye5.html).
- [Fuerte Taxi approximate airport rates](https://fuertetaxi.com/en/prices); [Las Palmas port transport](https://laspalmascruiseport.com/transportation/).
- [RentADrive port locations](https://www.rentadrive.pt/locations.html), [terms/out-of-hours](https://www.rentadrive.pt/terms.html), [deposit note](https://www.rentadrive.pt/reservation.html).
- [Madeira Rent FAQ](https://www.madeirarent.pt/en/faqs).



## Перевірені поправки від 07.11.2026

- PlusCar FUE €39.95 (Polo manual/5 місць, airport 07.01 09:30–18:30) — попередня live ціна; поле віку було 23–25. Перевірити тариф з віком основного водія та окремо портову зустріч. Якщо pickup тільки FUE, додається приблизно €40 sedan або €60 MPV за taxi round-trip, плюс пальне.
- Для CICAR/TopCar на Lanzarote, операторів Gran Canaria, Madeira та альтернатив Tenerife у звіті немає live checkout total на нашу дату. Це «не встановлено», а не «немає автомобілів».
- GAR105 Madeira: €2/день обов'язкового збору; SCDW включене в online total, якщо checkout це підтверджує; додатковий водій €2.50/день, child/booster €6/€2/день. Повернення 21:00–23:00 коштує €10; загальна ціна авто не отримана. RentADrive має €30 позаробочої доплати на повернення 21:30.
- Повернення TopCar з keybox без доплати підтверджене в аеропортах LPA/TFS/ACE, а не в круїзних офісах. Для FUE та TFN діють години доступу аеропортів; не закладати автоматичний цілодобовий drop.
- Сімейний total дорівнює тарифу авто з податками та обов'язковими покриттями + потрібні дитячі/другий водій надбавки + трансфер + пальне; депозит/hold показувати окремо. Немає підтверджених погодинних круїзних тарифів; бюджетувати як мінімум одноденний тариф, поки checkout не засвідчить коротший блок.




## Corrigendum — PlusCar date-specific availability with correct driver age (07.11.2026)

This direct official booking-form search supersedes the earlier note that treated the €39.95 result as selected for driver age 23–25. The second search selected age +30 (the appropriate group for the primary driver), Fuerteventura Airport, pickup 07.01.2027 09:30 and return 07.01.2027 19:30. The results page showed these live cars/prices for that 10-hour rental:

| Displayed class/model | Seats / transmission | Total shown |
|---|---|---:|
| Hyundai i10 | 4 / manual | €35.00 |
| Mitsubishi Star | 4 / manual | €35.00 |
| VW Polo | 5 / manual | €39.95 |
| Hyundai i10 | 4 / automatic | €39.95 |
| Audi A1 | 5 / manual | €45.00 |
| Skoda Fabia | 5 / automatic | €46.00 |

For four travelers, only the displayed five-seat classes are viable for seating; the Polo manual €39.95 is the lowest shown 5-seat manual class. The form labels prices as totals/€/day and shows IGIC, full-risk insurance, unlimited mileage, free extra driver and free change/cancellation as included; fuel is same-level. The reserved model is not guaranteed (similar class), trunk volume was not specified, deposit/card hold was not shown, and coverage exclusions remain (including tires/wheels, underbody, roof, interior and clutch). The search reached the vehicle-results page only; no car was selected and no booking/payment was made.

The pickup dropdown listed Fuerteventura Airport, Esmeralda and Prin Fuerte; it did not offer the cruise port. PlusCar's general Fuerteventura page advertises port delivery, but the direct form did not price or confirm that handover. Treat €39.95 as an exact-date, correct-age **airport** quote and port delivery as unresolved. A 10-hour booking returned the displayed one-day rate, so no shorter cruise-hour price was demonstrated. Source: [official PlusCar search](https://www.pluscarcanarias.com/en/home/) and [terms](https://www.pluscarcanarias.com/terminos-y-condiciones-de-alquiler/).
