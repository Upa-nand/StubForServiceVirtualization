
module.exports = 
{
	changeResponseFileSystem : function changeResponseFileSystems(req, resFlNm , url) { changeResponseFileSystem (req, resFlNm , url);},
	preHandler : function pre (req){preHandler(req);},
	postHandler : function post (req, reqBody, data, res) {postHandler(req, reqBody, data, res);}
};
// Implementation failed. Planned for future. 
function preHandler(req)
{
	return req;
}
// Implementation failed. Planned for future. 
function changeResponseFileSystem(req, resFlNm , url)
{
	return undefined;
}

//Working condition
function postHandler (req, reqBody, data, res)
{
console.log(req.updatedUrl)
	if(req.url === '/orders/appointments/' || req.updatedUrl === '/orders/appointments/')
	{
		res.end( JSON.stringify(fmsApptHandler(reqBody)) );
	}
	else if(req.url === '/orders/appointments/availability/' || req.updatedUrl === '/orders/appointments/availability/')
	{
		res.end( JSON.stringify(fmsSlotsHandler(reqBody)) );
	}
	else if(req.url === '/orders/appointments/reservation/' || req.updatedUrl === '/orders/appointments/reservation/')
	{
		res.status(202);
		res.end( JSON.stringify(fmsReservationHandler(reqBody)) );
	}
	else if(req.url === '/arc/tnt/')
	{
		res.end( JSON.stringify(arcTntService(reqBody)) );
	}
	else
	{
		res.end( data );
	}
}

function arcTntService(request) {
	
	request["timeTaken"] = "how does it matter";
	var nodeList = request.nodeList;
	
	for(var i = 0 ; i < nodeList.length; i++)
	{
		var date = new Date(); 
		
		//date.setDate("123456789".charAt(Math.floor(Math.random() * 10)));
		date.setDate(date.getDate()+(Math.floor(Math.random() * 10)));	
	
		var node = nodeList[i];
		
		node["availableDate"] = date.toISOString().slice(0,10);
		//node["availableDate"] = "2017-05-20";
		node["errorCode"] = "";
	}
	
	return request;
}


function fmsApptHandler(request){
	
	var orderLineItems = request.orderLineItems

	console.log(JSON.stringify(orderLineItems))
	orderLineItems.sort(function(a,b){if(a.itemGroupCode == 'PROD'){a.serviceTimeOffset = 0}if(b.itemGroupCode == 'PROD'){b.serviceTimeOffset = 0}return a.serviceTimeOffset >= b.serviceTimeOffset})
	
	//console.log(JSON.stringify(orderLineItems))
	var tempOffSetTime
	var grpId = 1
	
	for(var i=0; i < orderLineItems.length; i++)
	{
		debugger;
		var lineItem = orderLineItems[i];
		
		if(typeof tempOffSetTime === 'undefined')
		{
			tempOffSetTime = lineItem.serviceTimeOffset;
		}
		
		if(tempOffSetTime === lineItem.serviceTimeOffset)
		{
			lineItem["groupId"] = grpId;
		}
		else
		{
			++grpId;
			lineItem["groupId"] = grpId;
		}
		
		tempOffSetTime = lineItem.serviceTimeOffset;
	}
	
	var assignmentGroupsArr = [];
		
	for(var i = 1; i <= grpId; i++)
	{
		var newArr = orderLineItems.filter(function(elem){return elem.groupId == i})
		
		var tempResp = {"isThirdParty": false, "workForceDesignation": "BBY_SERVICES", "shipNode": "BBY_109","buildingNo":"9028" ,"groupId": i, "orderLineItems":[]};
		var lineItemsArr = tempResp.orderLineItems;
		
		for(var j = 0 ; j < newArr.length; j++)
		{
			var tempLine = newArr[j];
			var lineEle = {"orderLineKey":tempLine.orderLineKey, "skuId": tempLine.skuId, "isSkillsetAvailable": true, "parentOrderLineKey":tempLine.parentOrderLineKey	}
			
			lineItemsArr.push(lineEle);
		}
		
		assignmentGroupsArr.push(tempResp)
	}
		
	var response = {"appointmentGroups": assignmentGroupsArr, "isZipServiceable": true}
	console.log(JSON.stringify(response))
	return response;

}




function fmsSlotsHandler(request)
{
	var serviceStartSearchDate = request.serviceStartSearchDate ? new Date(request.serviceStartSearchDate) : new Date();
	
	var getDefaultSearchEndDate = function (){
		var date = new Date();
		date.setDate(date.getDate()+14)
		return date;
	}
	
	var serviceEndSearchDate = request.serviceEndSearchDate ? new Date(request.serviceEndSearchDate) : getDefaultSearchEndDate();
	console.log(JSON.stringify(request))
	console.log(serviceStartSearchDate)	
	var dateArr = [];
	var noOfDays = Math.ceil(Math.abs(serviceEndSearchDate.getTime() - serviceStartSearchDate.getTime()) / (1000 * 3600 * 24));
	for(var i = 0 ; i < noOfDays; i++)
	{
	//	var tempJson = {"date":serviceStartSearchDate.yyyymmdd(), "apptToken":Math.random(),"apptProvider":"BBY_SERVICES", "isPreferedslot":i%3 == 0 ? "N" : "Y"}
	var tempJson = {"date": serviceStartSearchDate.toISOString().slice(0,10).replace(/-/g,""), "apptToken":Math.random(),"apptProvider":"BBY_SERVICES", "isPreferedslot":i%3 == 0 ? "N" : "Y"};
		serviceStartSearchDate.setDate(serviceStartSearchDate.getDate()+1)
		console.log(JSON.stringify(tempJson))
		dateArr.push(tempJson);
	}	
	
	var response= 
	{
		  "isAltLocationAvailable": false,
		  "isAltProviderAvailable": false,
		  "isDependencyConsidered": false,
		  "serviceSlots": [{
			  	"startTime": "08:00:00",
				"endTime": "12:00:00",
				"dates":dateArr
		  },
		  {
			  	"startTime": "12:00:00",
				"endTime": "04:00:00",
				"dates":dateArr
		  },
		  {
				"startTime": "04:00:00",
				"endTime": "08:00:00",
				"dates":dateArr
		  }]
	}
	
	console.log(JSON.stringify(response))
	
	return response;
	
}

function fmsReservationHandler(request){
	
	var response = {"appointmentId": generateApptId()}
	console.log(JSON.stringify(response));

	return response;
}

function generateApptId()
{
    var id = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 16; i++ )
        id += possible.charAt(Math.floor(Math.random() * possible.length));

    return id;
}
/*
function getPheonixResponse(request){

	console.log(JSON.stringify(resp));
	var response= {
	"storeId": "4",
	"skuInfos": [{
			"sku": "1234567890",
			"availabilityType": "INSTOCK|PREORDER",
			"locationInfos": [{
					"pickupLocationId": "4",
					"availabilityInfo": {
						"lineItemNumber": 1,
						"excludeLocationList": ["234"],
						"reservationToken": "01234567890123-12345-12-3-RETAIL-B"
					}
				},
				{
					"pickupLocationId": "1000"

				}

			]
		}

	]
}

console.log(JSON.stringify(response))

	return response;

}*/

function getUrl(req)
{
	console.log("getUrl %s:",req)
	return (req ? req.url ? req.url: undefined : undefined);
}

