import PostModel from "../models/Post.js"

export const getLastTags = async (req, res) => {
    try {
        const posts = await PostModel.find().limit(5).exec()
        const tags = posts.map(obj => obj.tags)
            .flat()
            .filter((value, index, self) => self.indexOf(value) === index) //filter only unique values
            .slice(0, 5)

        res.json(tags)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: "Can't get tags"
        })
    }
}

export const getAll = async (req, res) => {
    try {
        const posts = await PostModel.find().populate('user').exec()

        res.json(posts)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: "Can't get posts"
        })
    }
}

export const getOne = async (req, res) => {
    try {
        const postId = req.params.id;

        const updatedPost = await PostModel.findByIdAndUpdate(
            { _id: postId },
            { $inc: { viewCount: 1 } },
            { returnDocument: 'after', new: true } // Added new: true parameter to return an updated document
        ).populate('user');

        if (!updatedPost) {
            return res.status(404).json({
                message: "Can't find post"
            });
        }

        res.json(updatedPost)
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Can't get post"
        });
    }
}

export const create = async (req, res) => {
    try {
        const doc = new PostModel({
            title: req.body.title,
            text: req.body.text,
            imageUrl: req.body.imageUrl,
            tags: req.body.tags.split(','),
            user: req.userId
        })

        const post = await doc.save()

        res.json(post)

    } catch (err) {
        console.log("err=>", err)
        res.status(500).json({
            message: "Post creation failed"
        })
    }
}

export const remove = async (req, res) => {
    try {
        const postId = req.params.id;

        const deletedPost = await PostModel.findOneAndDelete({ _id: postId });

        if (!deletedPost) {
            return res.status(404).json({
                message: "Can't find post"
            });
        }

        res.json({
            success: true
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Can't remove post"
        });
    }
};

export const update = async (req, res) => {
    try {
        const postId = req.params.id

        const updatedPost = await PostModel.findByIdAndUpdate(
            postId,
            {
                title: req.body.title,
                text: req.body.text,
                imageUrl: req.body.imageUrl,
                tags: req.body.tags.split(','),
                user: req.userId
            },
            { new: true } // return updated document
        )

        if (!updatedPost) {
            return res.status(404).json({
                message: "Can't find post"
            })
        }

        res.json(updatedPost)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: "Can't remove post"
        });
    }
}
