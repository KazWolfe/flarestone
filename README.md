# Flarestone

> [!WARNING]
> Flarestone is, at least, an experiment to learn about AI and other things, because despite my best efforts, it's
> something I can no longer avoid. As such, expect a lot of rough edges and not-particularly-great looking code.

Flarestone is a Lodestone scraper built to run on Cloudflare Workers. It fetches and transforms data from Lodestone into
a (slightly) more accessible JSON document. Instead of using CSS selectors like other Lodestone scrapers, Flarestone 
uses XPath for element targeting and manipulation.

Flarestone was primarily built for [XIVAuth](https://github.com/kazwolfe/xivauth), and has made certain implementation
decisions to make it most useful to XIVAuth. However, it can be self-hosted and used for other projects freely.

## Feature Set

Flarestone currently supports the following features:

* Retrieving basic character profiles by ID.
  * Retrieving leveling, class/job, and Field Operations data.
* Retrieving free company profiles by ID.
  * Retrieving free company members and ranks.
* Searching for characters by name and home world.

## Why Flarestone?

Not much. Nodestone and other applications do their jobs perfectly well. I wanted something that could run on Cloudflare
Workers and that leveraged XPath, since I consider them to be more capable for web scraping. I also wasn't particularly
a fan of how other Lodestone scrapers structured their data, so Flarestone was born.

There's not really a single solid (compelling) reason to use Flarestone over other applications, and I don't expect it
to somehow replace other Lodestone scrapers. It's just another option.

## Model Declaration

One unique feature of Flarestone is the use of decorators for model definition. Each page to be processed is defined as
a class, with properties decorated to indicate how to extract and transform data from the page. This allows for a
significant degree of control when it comes to deciding how data should look and be processed. 

## Using Flarestone

Flarestone can be self-hosted on Cloudflare Workers or run locally via Wrangler.
