import {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentProfile, getUserUID, isUserSignedIn, getTasks, getUserProfile } from '../firebase';
import DashboardTask from '../models/DashboardTask';
import {User} from '../models/User';
import '../styles/TaskDashboard.css'

const TaskDashboard = () => {
    const [tasks, setTasks] = useState<Array<any>>([]);
    const [signedIn, setSignedIn] = useState<boolean>(true);
    const [user, setUser] = useState<User>();
    const [uid, setUID] = useState<any>("");
    const [refresh, setRefresh] = useState<boolean>(false);

    const updateParent = () => {
        setRefresh(!refresh);
        console.log(refresh);
    }
    
    let navigate = useNavigate();
    
    useEffect(() => {
        const isSignedIn = async () => {
            const signedIn = await isUserSignedIn();
            setSignedIn(signedIn);
        }
        isSignedIn();
    }, []);

    useEffect(() => {
        if (!signedIn) {
            return navigate("/")
        }
    }, [signedIn]);

    useEffect(() => {
        const getUser = async () => {
            const currentProfile = await getCurrentProfile();
            setUser(currentProfile);
        }
        getUser();
    }, []);

    useEffect(() => {
        const getUID = async () => {
            setUID(await getUserUID());
        }
        getUID();
    }, [user]);

    useEffect(() => {
        const getAllTasks = async () => {
            const allTasks = await getTasks()
            const pendingTasks = allTasks!.filter((task) => !task.approved)
            const userCreatedTasks = allTasks!.filter((task => task.createdBy == uid && task.assigned != user?.committee));
            const committeeTasks = allTasks!
                .filter((task) => task.approved)
                .filter((task) => task.assigned == user?.committee)
            setTasks(pendingTasks.concat(committeeTasks).concat(userCreatedTasks));
        }
        getAllTasks();
    }, [user, refresh]);

    return (
        <div className="TaskDashboard">
            <div className="Unapproved">
                <h1> Unapproved Tasks </h1>
                <div className="UnapprovedTasks">
                    {tasks.filter(task => !task.approved)
                        .filter(task => task.assigned == user?.committee!).length !== 0 ? tasks.filter(task => !task.approved)
                        .filter(task => task.assigned == user?.committee!)
                        .map(task => (
                            <DashboardTask
                                task={task}
                                uid={task.createdBy}
                                updateParent={updateParent}
                            />
                        )) : <div> Nothing to see here! </div>
                    }
                </div>
            </div>
            <div className="Pending">
            <h1> Pending Tasks </h1>
                <div className="PendingTasks">
                    {tasks.length !== 0 &&  tasks.filter(task => task.approved && (task.assigned == user?.committee || task.createdBy == uid))
                        .map(task => (
                            <DashboardTask
                                task={task}
                                uid={task.createdBy}
                                updateParent={updateParent}
                            />
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default TaskDashboard