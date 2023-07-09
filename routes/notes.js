const express = require('express');
var fetchuser = require('../middleware/fetchuser');
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Route 1: Get all the notes using: GET "api/notes/fetchallnotes" Login Required 
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id });
        res.json(notes);
    } catch (e) {
        console.error(e.message);
        res.status(500).send("Internal Server Error");
    }
});

// Route 2: Add a new note using: POST "api/notes/addnote" .Login Required
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must be atleast 5 characters').isLength({ min: 5 }),
    ], async (req, res) => {
        try {

            const { title, description, tag } = req.body;

            // If there are errors, return Bad request and the errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const note = new Notes({
                title, description, tag, user: req.user.id
            })
            const savedNote = await note.save()

            res.json(savedNote)

        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal Server Error");
        }
});

// Route 3: Update an existing Note using :PUT "api/notes/updatenote" .Login Required
router.put('/updatenote/:id', fetchuser,async (req, res)=>{
    const {title, description, tag} = req.body;
    try{
        // Create new note object 
        const newNote = {};
        if(title){newNote.title = title};
        if(description){newNote.description = description};
        if(tag){newNote.tag = tag};
        
        // Find the note to be updated
        let note = await Notes.findById(req.params.id);
        if(!note){return res.status(404).send("Not Found")}
        
        if(note.user.toString() != req.user.id){
            return res.status(404).send("Not allowed");
        }
        note = await Notes.findByIdAndUpdate(req.params.id, {$set: newNote}, {new:true});
        res.json({note});
    }catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }

})

// Route 4: Delete an existing Notes using: DELETE "api/notes/deletenote" .Login Required
router.delete('/deletenote/:id', fetchuser, async (req,res)=>{
    try{
        // Find the note to be delete and delete it
        let note = await Notes.findById(req.params.id);
        if(!note){return res.status(404).send("Not Found")}
        
        //Check whether the id is existinh or not
        if(note.user.toString() != req.user.id){
            return res.status(404).send("Not allowed");
        }
        
        note = await Notes.findByIdAndDelete(req.params.id);
        res.json({"Success":"Note is Deleted"});
    }catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

module.exports = router