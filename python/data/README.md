Place your word-list CSV files in this folder:

- adjectives.csv
- nouns.csv
- verbs.csv
- adverbs.csv

Format:

```
word,length
quick,5
run,3
...
```

The generator only uses the first column (word). The length column is optional.

You can override this folder via the environment variable:

- PASS_PHRASE_DATA_DIR
