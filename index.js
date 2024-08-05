const { name } = require("ejs");
const express= require("express");
const app= express();
const mongoose= require("mongoose");
const Listing = require("./models/listing");
const path= require("path");
const methodoverride= require("method-override");
const engine = require('ejs-mate');

app.engine('ejs', engine);
app.use(methodoverride('_method'));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,"public")));

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/travel");
}
main().then(()=>{
    console.log("connection successful");
}).catch((err)=>{
    console.log(err);
})

app.get("/", (req, res)=>{
    res.send("Working");
});

app.get("/listings", async(req,res)=>{
    let allListings= await Listing.find({});
    res.render("listings/indexroot.ejs", {allListings});
})


app.get("/listings/new", (req, res)=>{
    res.render("listings/new.ejs");
})

app.post("/listings",async(req, res)=>{
    const newListing= new Listing(req.body.listing);
    await Listing.insertMany(newListing);
    res.redirect("/listings");
})

app.get("/listings/:id", async(req,res)=>{
    let {id}= req.params;
    const list= await Listing.findById(id);
    res.render("listings/show.ejs", {list});
})

app.get("/listings/:id/edit", async(req,res)=>{
    let{id}= req.params;
    const list= await Listing.findById(id);
    res.render("listings/edit.ejs",{list});
});

app.put("/listings/:id", async(req,res)=>{
    let {id}= req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`)
})

app.delete("/listings/:id", async(req,res)=>{
    let {id}= req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
})

app.listen(8080, ()=>{
    console.log("listening to port 8080");
})