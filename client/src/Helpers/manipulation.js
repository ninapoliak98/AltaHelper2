import moment from "moment";

const removeSpaces = (data) => data.replace(' ', '')

export function defaultData (data, finalData) {
	data['alta'].forEach((row) => {
		let tripNumber = convertVoucher(row['VOUCHER'], row['WAY'])
		finalData(tripNumber, {
			'JOB DATE': row['JOB DATE'],
			'TRIP NUMBER': convertVoucher(row['VOUCHER'], row['WAY']),
			'WAY': row['WAY'],
			'CLIENT NAME': row['NAME'],
			'SCHEDULED PU': '',
			'PICKUP': row['PICKUP'],
			'PU TIME DIFFERENCE': '',
			'PU LATE': '',
			'DO TIME': row['DROPOFF'],
			'DO TIME DIFF': '',
			'DO LATE': '',
			'CAR NUMBER': row['CARNUM'],
			'DRIVER NAME': row['DRNAME'],
			'DRIVETIME': row['DRIVE TIME'],
		})
	})
}

export function modivCareDefaultData (data, finalData) {
	data['modiv'].forEach((modiv) => {
		let trip = removeSpaces(modiv['Trip ID']);
		if(finalData.get(trip) && finalData.get(trip)['JOB DATE'] === modiv['Trip Date']) {
			finalData.get(trip)['APT TIME'] = modiv['Appointment Time']
		}
	})
}

export function convertVoucher (data, leg) {
	let arr = data.split('-')
	arr.splice(1,1)
	return removeSpaces(`${arr.join('-')}-${leg}`)
}

export function splitDate (data) {
	data.forEach((row) => {
		let splitDate = row['JOB DATE'].split(' ')
		row['JOB DATE'] = splitDate[0];
		row['SCHEDULED PU'] = splitDate[1]
	})
}


