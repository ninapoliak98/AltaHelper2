import React, {useCallback, useEffect, useState} from 'react';
import Papa from 'papaparse'
import moment from "moment";
import { ExportToCsv } from 'export-to-csv';
import {convertVoucher} from "../Helpers/manipulation";

function ModivLate() {
	// const [parsedData, setParsedData] = useState({})
	const parsedData = {}
	// const [finalData, setFinalData] = useState({})
	const finalData = {}

	const removeSpaces = (data) => data.replace(' ', '')

	function defaultData (data, finalData) {
		data['alta']?.forEach((row) => {
			let tripNumber = convertVoucher(row['VOUCHER'], row['WAY'])
			finalData[tripNumber] = {
				'JOB DATE': row['JOB DATE'],
				'TRIP NUMBER': convertVoucher(row['VOUCHER'], row['WAY']),
				'WAY': row['WAY'],
				'CLIENT NAME': row['NAME'],
				'SCHEDULED PU': '',
				'PICKUP': row['PICKUP'],
				'PU TIME DIFFERENCE': '',
				'PU LATE': '',
				'APT TIME': '',
				'DO TIME': row['DROPOFF'],
				'DO TIME DIFF': '',
				'DO LATE': '',
				'CAR NUMBER': row['CARNUM'],
				'DRIVER NAME': row['DRNAME'],
				'DRIVETIME': row['DRIVE TIME'],
			}
		})
	}

	function splitDate (data) {
		for (let row in data) {
			let splitDate = data[row]['JOB DATE'].split(' ')
			data[row]['JOB DATE'] = splitDate[0];
			data[row]['SCHEDULED PU'] = splitDate[1]
		}
	}
 	function modivCareDefaultData (data, fData) {
		data['modiv'].forEach((modiv) => {
			let trip = removeSpaces(modiv['Trip ID']);
			let date = moment(modiv['Trip Date']).format('l')
			if(fData[trip] && fData[trip]['JOB DATE'] === date) {
			 	fData[trip]['APT TIME'] = modiv['Appointment Time']
			}
		})
	}

	const changeHandler = (e, name) => {
		Papa.parse(e.target.files[0], {
			header: true,
			skipEmptyLines: true,
			complete: function (results) {
				parsedData[name] = results.data
			}
		});
	}

	function legTimeDifference (data, tripTime, driverTime, rowDiff, lateRow) {
		for(let row in data) {
			let modivPU = moment(data[row][tripTime],'HH:mm a')
			let driverPU = moment(data[row][driverTime],'HH:mm a')
			if(modivPU.format('HH:mm a') === moment('00:00', 'HH:mm a').format('HH:mm a')) {
				data[row][rowDiff] = 0
				data[row][tripTime] = 0
				continue
			}
			data[row][rowDiff] = driverPU.diff(modivPU, 'minutes')
			data[row][tripTime] = modivPU.format('HH:mm a')
			data[row][driverTime] = driverPU.format('HH:mm a')
			if(data[row][rowDiff] > 15) {
				data[row][lateRow] = 'late'
			}
			if(data[row][rowDiff] < 15) {
				data[row][lateRow] = 'not late'
			}
		}

	}

	const handleSubmit = (e) => {
		e.preventDefault();
		defaultData(parsedData, finalData)
		splitDate(finalData)
		modivCareDefaultData(parsedData, finalData)
		legTimeDifference(finalData, "SCHEDULED PU", "PICKUP", "PU TIME DIFFERENCE", 'PU LATE')
		legTimeDifference(finalData, "APT TIME", "DO TIME", "DO TIME DIFF", 'DO LATE')
	}
	const handleDownload = async (e, data) => {
		e.preventDefault();
		const options = {
			fieldSeparator: ',',
			quoteStrings: '"',
			decimalSeparator: '.',
			showLabels: true,
			showTitle: true,
			useTextFile: false,
			useBom: true,
			useKeysAsHeaders: true,
		};
		const csvExporter = new ExportToCsv(options);
		csvExporter.generateCsv(Object.values(data));
	}

    return (
        <div>
            <form>
              	<label>Alta File</label>
				<input type="file" accept=".csv" onChange={(e) => changeHandler(e, 'alta')}/>
				<label>Modiv File</label>
				<input type="file" accept=".csv" onChange={(e) => changeHandler(e, 'modiv')}/>
				<button onClick={handleSubmit}> Submit </button>
				<button onClick={(e) => handleDownload(e, finalData)}> Download </button>
            </form>
        </div>
    );
}

export default ModivLate;