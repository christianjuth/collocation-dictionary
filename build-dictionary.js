let nlp = require('compromise'),
	fs = require('fs');






fs.readdir('./texts', function(err, files) {
    let texts = files
    .filter(filename => /.+\.txt/.test(filename))
    .map(filename => {
		return fs.readFileSync('./texts/' + filename, 'utf8');
    })
    .join('\n');

    

    let doc = nlp(texts),
    	dictionary = {},
    	descriptorCount = 0;

    let extract = (matchString, type) => {
    	let matches = doc.match(matchString).out('array').filter(str => str.indexOf('-') == -1);

    	if(dictionary[type] == null) dictionary[type] = {};
	
		matches
		.sort((a, b) => {
			a = a.split(' ')[1];
			b = b.split(' ')[1];
			return a > b ? 1 : -1;
		})
		.forEach(wordPair => {
			let split = wordPair.split(' '),
				descriptor = split[0].toLowerCase(),
				noun = split[1].toLowerCase();

			if(dictionary[type][noun] == null)
				dictionary[type][noun] = [descriptor]
			else
				dictionary[type][noun].push(descriptor);
		});

		Object.keys(dictionary[type])
		.forEach((word) => {
			let descriptors = dictionary[type][word];
			let raking = {};
			descriptors.forEach((descriptor) => {
				if(raking[descriptor] == null){
					raking[descriptor] = 1;
					descriptorCount++;
				}
				else
					raking[descriptor]++;
			});
			dictionary[type][word] = raking;
		});

		console.log(`${Object.keys(dictionary[type]).length} ${type}s`);
    }


    extract('#Adjective #Noun', 'noun');
    // extract('#Adjective #Adjective', 'adjective');
    extract('#Adverb #Verb', 'verb');

    console.log(`${descriptorCount} descriptors\n`);
	fs.writeFileSync('src/dictionary.json', JSON.stringify(dictionary, null, 4));
});