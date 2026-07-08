import API from "../api.js";
import SOURCES from "./sources.js";


class AniListScraper {

static cache=new Map();

static TTL=1800000;



static async fetchHTML(url){

for(let i=0;i<3;i++){

try{

let r=await fetch(url,{
headers:{
"User-Agent":"Mozilla/5.0",
"Accept":"text/html"
}
});

if(r.ok)
return await r.text();

}catch{}

}

return null;

}



static clean(v){

return v?
String(v)
.replace(/\\u002F/g,"/")
.replace(/\\"/g,'"')
.trim():null;

}



static async gql(query,variables){

return await API.post(
SOURCES.anilist.graphql,
{
query,
variables
}
);

}



static formats(list=[]){

let out={};

for(let x of list){

let f=x.media?.format;

if(f)
out[f]=(out[f]||0)+1;

}

return out;

}



static extractJSON(html){

try{

let x=html.match(
/<script id="__NEXT_DATA__".*?>(.*?)<\/script>/
);

return x?JSON.parse(x[1]):null;

}catch{

return null;

}

}



static async apiProfile(username){

let q=`

query($name:String){

User(name:$name){

id
name
about

avatar{
large
}

bannerImage


statistics{

anime{

count
episodesWatched
minutesWatched
meanScore

formatStats{
format
count
}

}


manga{

count
chaptersRead
volumesRead

formatStats{
format
count
}

}

}

favourites{

anime{
nodes{
title{
romaji
}
}
}

manga{
nodes{
title{
romaji
}
}
}

}


}

}

`;


let r=await this.gql(q,{
name:username
});


return r?.data?.User||null;

}



static async htmlProfile(username){

let html=
await this.fetchHTML(
SOURCES.anilist.profile+username
);


if(!html)
return null;


let json=this.extractJSON(html);


return json
?.props
?.pageProps
?.data
?.User||null;

}




static async getProfile(username){

let key="profile:"+username;

let cached=this.cache.get(key);


if(cached && Date.now()-cached.time<this.TTL)
return cached.data;



let user=
await this.apiProfile(username);



if(!user)
user=
await this.htmlProfile(username);



if(!user)
return null;



let data={


source:"AniList Hybrid Scraper",

username,

profile:{

id:user.id,

name:user.name,

avatar:this.clean(
user.avatar?.large
),

banner:this.clean(
user.bannerImage
),

about:user.about

},



statistics:{


anime:{

total:
user.statistics?.anime?.count||0,

episodes:
user.statistics?.anime?.episodesWatched||0,

minutes:
user.statistics?.anime?.minutesWatched||0,

score:
user.statistics?.anime?.meanScore||0,


formats:
Object.fromEntries(
user.statistics?.anime?.formatStats
?.map(x=>[
x.format,
x.count
])||[]
)

},



manga:{

total:
user.statistics?.manga?.count||0,

chapters:
user.statistics?.manga?.chaptersRead||0,

volumes:
user.statistics?.manga?.volumesRead||0,


formats:
Object.fromEntries(
user.statistics?.manga?.formatStats
?.map(x=>[
x.format,
x.count
])||[]
)

}


},



favorites:{

anime:
user.favourites?.anime?.nodes||[],

manga:
user.favourites?.manga?.nodes||[]

}


};



this.cache.set(key,{
time:Date.now(),
data
});


return data;

}


}


export default AniListScraper;