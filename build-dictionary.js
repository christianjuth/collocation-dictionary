let nlp = require('compromise'),
	fs = require('fs');






fs.readdir('./texts', function(err, files) {
    let texts = files
    .filter(filename => /.+\.txt/.test(filename))
    .map(filename => {
		return fs.readFileSync('./texts/' + filename, 'utf8');
    })
    .join('\n');
    fs.writeFileSync('public/texts.txt', texts);

    

    let doc = nlp(texts),
    	dictionary = {};

    let extract = (matchString, not, type) => {
    	let matches = doc.match(matchString).not(not).out('array').filter(str => str.indexOf('-') == -1);

    	if(dictionary[type] == null) dictionary[type] = {};
	
		matches
		.sort((a, b) => {
			a = a.split(' ')[1];
			b = b.split(' ')[1];
			return a > b ? 1 : -1;
		})
		.forEach(wordPair => {
			if(wordPair.indexOf(' ') == -1) return;

			let convert = nlp(wordPair);
			convert.nouns().toSingular();
			convert.contractions().expand();
			wordPair = convert.out();

			let split = wordPair.split(' '),
				descriptor = split.shift().toLowerCase(),
				noun = split.join(' ').toLowerCase();

			if(!/^[a-z]+$/.test(noun)) return;

			if(dictionary[type][noun] == null)
				dictionary[type][noun] = [descriptor]
			else
				dictionary[type][noun].push(descriptor);
		});
    }


    extract('#Adjective #Noun', '', 'noun');
    extract('#Value #Noun', '#Cardinal', 'noun');
    // extract('#Adjective #Adjective', '', 'adjective');
    extract('#Adverb #Verb', '', 'verb');


    let descriptorCount = 0;
    Object.keys(dictionary).forEach(type => {
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
    });
    console.log(`${descriptorCount} descriptors\n`);


	fs.writeFileSync('src/dictionary.json', JSON.stringify(dictionary, null, 4));
});