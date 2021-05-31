async function dnsRequest(name, type) {
	const response = await fetch(
		"https://cloudflare-dns.com/dns-query?name=" +
		name +
		"&type=" +
		type +
		"&ct=application/dns-json"
	);

	return response;
}

const handleRequest = async event => {
	// getting the hostname from the path
	// https://dig.wtf/v3/d/hostname/
	const url = new URL(event.request.url);
	const name = url.pathname.split("/")[2];

	if (name == null || name == "") {
		return new Response("name is missing", {
			status: 406,
			statusText: "Not Acceptable"
		});
	}

	const type_map = {
		1: "A",
		2: "NS",
		3: "MD",
		4: "MF",
		5: "CNAME",
		6: "SOA",
		7: "MB",
		8: "MG",
		9: "MR",
		11: "WKS",
		12: "PTR",
		13: "HINFO",
		14: "MINFO",
		15: "MX",
		16: "TXT",
		17: "RP",
		18: "AFDB",
		19: "X25",
		20: "ISDN",
		21: "RT",
		22: "NSAP",
		23: "NSAP-PTR",
		24: "SIG",
		25: "KEY",
		26: "PX",
		27: "GPOS",
		28: "AAAA",
		29: "LOC",
		30: "NXT",
		31: "EID",
		32: "NIMLOC",
		33: "SRV",
		34: "ATMA",
		35: "NAPTR",
		36: "KX",
		37: "CERT",
		38: "A6",
		39: "DNAME",
		40: "SINK",
		41: "OPT",
		42: "APL",
		43: "DS",
		44: "SSHFP",
		45: "IPSECKEY",
		46: "RRSIG",
		47: "NSEC",
		48: "DNSKEY",
		49: "DHCID",
		50: "NSEC3",
		51: "NSEC3PARAM",
		52: "TLSA",
		53: "SMIMEA",
		55: "HIP",
		56: "NINFO",
		57: "RKEY",
		58: "TALINK",
		59: "CDS",
		60: "CDNSKEY",
		61: "OPENPGPKEY",
		62: "CSYNC",
		63: "ZONEMD",
		64: "SVCB",
		65: "HTTPS",
		99: "SPF",
		100: "UINFO",
		101: "UID",
		102: "GID",
		103: "UNSPEC",
		104: "NID",
		105: "L32",
		106: "L64",
		107: "LP",
		108: "EUI48",
		109: "EUI64",
		249: "TKEY",
		250: "TSIG",
		251: "IXFR",
		252: "AXFR",
		253: "MAILB",
		254: "MAILA",
		256: "URI",
		257: "CAA",
		258: "AVC",
		259: "DOA",
		260: "AMTRELAY",
		32768: "TA"
	};

	//https://developers.cloudflare.com/workers/platform/limits#cpu-runtime
	//You can only have 6 simultaneous calls
	const answers = await Promise.all([
		fetch("https://cloudflare-dns.com/dns-query?name=" + name + "&type=A&ct=application/dns-json"),
		fetch("https://cloudflare-dns.com/dns-query?name=" + name + "&type=AAAA&ct=application/dns-json"),
		//fetch("https://cloudflare-dns.com/dns-query?name=" + name + "&type=CNAME&ct=application/dns-json"),
		fetch("https://cloudflare-dns.com/dns-query?name=" + name + "&type=NS&ct=application/dns-json"),
		fetch("https://cloudflare-dns.com/dns-query?name=" + name + "&type=MX&ct=application/dns-json"),
		fetch("https://cloudflare-dns.com/dns-query?name=" + name + "&type=TXT&ct=application/dns-json"),
		fetch("https://cloudflare-dns.com/dns-query?name=" + name + "&type=SOA&ct=application/dns-json")
	]).then(function (responses) {
		// Get a JSON object from each of the responses
		return Promise.all(responses.map(function (response) {
			return response.json();
		}));
	}).then(function (data) {
		return data.map(function(answers){
			if ( "Answer" in answers ){
				return answers["Answer"].map(function (answer) {
					return answer;
				});
			}
		});
	}).then(function (data) {
		// remove empty entries
		return [].concat.apply([], data).filter( x => x );
	}).then(function (data) {
		// remove duplicate entries
		return data.filter((v,i,a)=>a.findIndex(t=>(t.type === v.type && t.data===v.data))===i);
	}).then(function (data) {
		return data.map(function(answers){
			if ( answers.type in type_map ){
				answers.type = type_map[answers.type];
			}

			return answers;
		});
	}).catch(function (error) {
		console.log(error);

		return error;
	});
	
	const responseInit = {
		headers: {
			"Content-Type": "application/x-javascript; charset=UTF-8",
			"Access-Control-Allow-Origin": "*"
		}
	};

	//return new Response(response.body, responseInit);
	return new Response(JSON.stringify(answers), responseInit);
};

addEventListener("fetch", event => event.respondWith(handleRequest(event)));
