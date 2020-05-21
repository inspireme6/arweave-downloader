var arweave = Arweave.init({host: 'arweave.net', port: 443, protocol: 'https'});

const contentTypesList = [
	['.bmp', 	'image/bmp'],
	['.css', 	'text/css'],
	['.csv', 	'text/csv'],
	['.doc', 	'application/msword'],
	['.docx',	'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
	['.epub', 	'application/epub+zip'],
	['.gz', 	'application/gzip'],
	['.gif', 	'image/gif'],
	['.html', 	'text/html'],
	['.ico', 	'image/vnd.microsoft.icon'],
	['.jar',	'application/java-archive'],
	['.jpg',	'image/jpeg'],
	['.js',		'text/javascript'],
	['.json',	'application/json'],
	['.jsonld',	'application/ld+json'],
	['.mp3', 	'audio/mpeg'],
	['.mpeg', 	'video/mpeg'],
	['.otf', 	'font/otf'],
	['.png', 	'image/png'],
	['.pdf', 	'application/pdf'],
	['.ppt', 	'application/vnd.ms-powerpoint'],
	['.pptx',	'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
	['.rar',	'application/vnd.rar'],
	['.rtf',	'application/rtf'],
	['.sh', 	'application/x-sh'],
	['.svg', 	'image/svg+xml'],
	['.swf', 	'application/x-shockwave-flash'],
	['.tar', 	'application/x-tar'],
	['.ttf', 	'font/ttf'],
	['.txt', 	'text/plain'],
	['.wav', 	'audio/wav'],
	['.webm', 	'video/webm'],
	['.webp', 	'image/webp'],
	['.woff', 	'font/woff'],
	['.woff2', 	'font/woff2'],
	['.xhtml', 	'application/xhtml+xml'],
	['.xls', 	'application/vnd.ms-excel'],
	['.xlsx', 	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
	['.xml', 	'text/xml'],
	['.xml',	'application/xml'],
	['.xul', 	'application/vnd.mozilla.xul+xml'],
	['.zip', 	'application/zip'],
	['.7z',		'application/x-7z-compressed']];
	
// credits to https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

async function getTransactionsFromAddress(address){
    const transactions = await arweave.arql({
				op: 'equals',
				expr1: 'from',
				expr2: address,
			});
	if (transactions.length == 0){
		try {
			const transaction = await arweave.transactions.get(address);
			return [address]
		} catch (err){
			return [];
		}
	}		
	return transactions;
}

function getExtension(tx){
	const tags = tx.get('tags');
	var ctype = '.';
	if (tags.length > 0){
		tags.forEach(tag => {
			if (tag.get('name', {decode: true, string: true}) == 'Content-Type'){
				const contentType = tag.get('value', {decode: true, string: true})
				for (var x=0; x<contentTypesList.length; x++){
					if (contentTypesList[x][1] == contentType){
						ctype = contentTypesList[x][0];
						break;
					}
				}
			}
		})
	}
	return ctype;
}

function selectAll(){
  $(':checkbox').prop('checked', true);
}

function unselectAll(){
  $(':checkbox').prop('checked', false);
}

async function doSearch(){
	const searchText = $('.search-text').val();
	try {
		const transactions = await getTransactionsFromAddress(searchText);
		console.log(transactions);
	
		if (transactions.length > 0){
			transactions.forEach(x => {
				$('.awesomelist').append('<div class="col border mb-1"><label class="lbl"><input type="checkbox" class="mr-1" data-txid="' + x + '" checked /><a href="https://viewblock.io/arweave/tx/' + x + '">' + x + '</a></label></div>');
				$('.msg').html('Found ' + transactions.length + ' results.<br><a href="#" onclick="selectAll();">Select</a> / <a href="#" onclick="unselectAll();">Unselect all</a>');
				$('.download').show();
			});
		} else {
			$('.msg').html('Found 0 results.');
			$('.download').hide();
		}
	} catch (err){
			$('.msg').html(err.toString());
			$('.download').hide();
	}			
}

async function download(){
	var txArray = [];
	var zip = new JSZip();
	
	$('.awesomelist input[type=checkbox]:checked').each(function () {
        const txid = $(this).data("txid");
		txArray.push(txid);
	});
	if (txArray.length > 0){
		$('#button-n').hide();
		$('#button-l').show();
		$('.downloadbtn').attr('disabled', true);
	
		var counter = 1;
		await asyncForEach(txArray, async (x) => {
			const tx = await arweave.transactions.get(x);
			const fileExt = getExtension(tx);
			const txdata = tx.get('data', {decode: true});
			const filename = x + fileExt;
			console.log(txdata);
			zip.file(filename, txdata, {binary:true});
			$('.processing').html('Processing ' + counter + '/' + txArray.length);
			counter++;
		});
		var blob = await zip.generateAsync({type: 'blob'});
		const searchText = $('.search-text').val();
		saveAs(blob, searchText + '.zip');
		
		$('#button-l').hide();
		$('#button-n').show();
		$('.downloadbtn').attr('disabled', false);
	} else {
		alert('You need to select at least 1 tx!');
	}	
}

var $searchform = $('#searchForm').on('submit', async function () {
	$('.awesomelist').html('');
	$('.msg').html('');	
	$('.download').hide();
	$('.loading-1').show();
	await doSearch();
	$('.loading-1').hide();
});

var $downloadform = $('#downloadForm').on('submit', async function () {
	await download()
});