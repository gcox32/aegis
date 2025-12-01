## Training

There are a few routes by which a user might interact with the app when it comes to physical training. `Protocols`, the top-level training unit, need to be constructed, either by the grouping and ordering of `Workouts` or by the building of `Workouts` (and subsequently grouping and ordering `Workouts`). `Workouts` are the grouping and ordering of `Workout Blocks` (which may need to be built on the fly as well), which are grouped and ordered `Workout Block Exercises`, which of course rely on existing `Exercises` (unless we are creating them on the fly as well).

### Construction
We have CRUD functions behind endpoints that allow us to create, read, update, and delete the training program building blocks. We need a smooth way to move up, down, in, and out of these elements so that we can seamlessly reference new data.

### Active Session
The overwhelming majority of time spent in the training portion of the app _ought_ to be _actually training_. To this end, we want to have a world class workout experience. This means UX like:
- a progress bar for the percentage of `Workout` complete
- a running timer to track `Workout`, `Workout Block`, or `Workout Block Exercise` duration
- a rest timer and sound for marking rest ending
- a loop of the video (if there is a video url)
- the ability to edit the perscribed measures of any particular `Workout Block Exercise` (for example if 10 reps are perscribed by the user could only do 8, they should be able to edit the "10" to make the actual performance accurate)

### Summary
Completing a Workout should trigger a few writes of summary statistics:
- on the `Workout` and `Workout Block` level, we want to track `Performance Stats`, which include things like `Volume` and `Average Power` (the latter being a future feature) as well as `Duration`
- on the `Workout Block Exercise` level, we want to track a calculated `Projected 1 RM` (derived from the "best set")
- other metrics laid out in the schema and train.ts types file