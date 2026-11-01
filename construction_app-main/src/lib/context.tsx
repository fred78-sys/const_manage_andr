import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, supabaseConfigured, toDbRow, fromDbRow, newId } from './supabase';
import { UserProfile, UserRole, Project, Task, DailyLog, Expense, ProjectDocument, ActivityItem, TaskStatus } from './types';

interface AppContextType {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  projects: Project[];
  tasks: Task[];
  dailyLogs: DailyLog[];
  expenses: Expense[];
  documents: ProjectDocument[];
  activities: ActivityItem[];
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  selectedProject: Project | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  createProject: (project: Omit<Project, 'id' | 'createdAt'>) => Promise<string>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<string>;
  updateTaskStatus: (taskId: string, status: TaskStatus, blockReason?: string) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  createDailyLog: (log: Omit<DailyLog, 'id' | 'createdAt'>) => Promise<string>;
  deleteDailyLog: (id: string) => Promise<void>;
  createExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<string>;
  deleteExpense: (id: string) => Promise<void>;
  createDocument: (document: Omit<ProjectDocument, 'id' | 'uploadDate'>) => Promise<string>;
  uploadDocumentFile: (file: File, projectId: string) => Promise<{fileUrl:string; fileName:string; fileSize:string; storagePath:string}>;
  uploadDailyPhoto: (file: File, projectId: string, logId?: string) => Promise<{url:string; storagePath:string}>;
  deleteDocument: (id: string) => Promise<void>;
  isSupabaseLive: boolean;
  authLoading: boolean;
  canAccessProject: (projectId: string) => boolean;
  visibleProjects: Project[];
}

const AppContext = createContext<AppContextType | null>(null);
const emptyUser = null as unknown as UserProfile;
const tables = ['projects', 'tasks', 'daily_logs', 'expenses', 'documents', 'activities'] as const;

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(emptyUser);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [isSupabaseLive, setIsSupabaseLive] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const clearData = useCallback(() => {
    setCurrentUser(emptyUser); setAllUsers([]); setProjects([]); setTasks([]);
    setDailyLogs([]); setExpenses([]); setDocuments([]); setActivities([]);
    setSelectedProjectId(''); setIsSupabaseLive(false);
  }, []);

  const loadProfileAndData = useCallback(async (session: Session | null) => {
    if (!session?.user) { clearData(); return; }
    const { data: profile, error: profileError } = await supabase
      .from('profiles').select('*').eq('id', session.user.id).maybeSingle();
    if (profileError) throw profileError;
    if (!profile) throw new Error('Your account profile is missing. Ask an administrator to provision your profile.');
    const user = fromDbRow<UserProfile>({ ...profile, uid: profile.id });
    setCurrentUser(user);

    const [usersResult, ...results] = await Promise.all([
      supabase.from('profiles').select('*').order('name'),
      ...tables.map((table) => supabase.from(table).select('*').order(table === 'documents' ? 'upload_date' : table === 'activities' ? 'timestamp' : table === 'daily_logs' ? 'date' : 'created_at', { ascending: false }).limit(1000))
    ]);
    if (usersResult.error) throw usersResult.error;
    setAllUsers((usersResult.data || []).map((row) => fromDbRow<UserProfile>({ ...row, uid: row.id })));
    for (let index = 0; index < results.length; index++) {
      const result = results[index];
      if (result.error) throw result.error;
      let rows = (result.data || []).map((row) => fromDbRow<any>(row));
      if (tables[index] === 'documents') rows = await Promise.all(rows.map(async (row) => { if (!row.storagePath) return row; const { data } = await supabase.storage.from('project-documents').createSignedUrl(row.storagePath, 3600); return data?.signedUrl ? { ...row, fileUrl: data.signedUrl } : row; }));
      if (tables[index] === 'daily_logs') rows = await Promise.all(rows.map(async (row) => ({ ...row, photos: await Promise.all((row.photos || []).map(async (photo: any) => { if (!photo.storagePath) return photo; const { data } = await supabase.storage.from('daily-log-photos').createSignedUrl(photo.storagePath, 3600); return data?.signedUrl ? { ...photo, url: data.signedUrl } : photo; })) })));
      if (tables[index] === 'daily_logs') rows.sort((a,b) => b.date.localeCompare(a.date));
      if (tables[index] === 'expenses') rows.sort((a,b) => b.date.localeCompare(a.date));
      switch (tables[index]) {
        case 'projects': setProjects(rows as Project[]); break;
        case 'tasks': setTasks(rows as Task[]); break;
        case 'daily_logs': setDailyLogs(rows as DailyLog[]); break;
        case 'expenses': setExpenses(rows as Expense[]); break;
        case 'documents': setDocuments(rows as ProjectDocument[]); break;
        case 'activities': setActivities(rows as ActivityItem[]); break;
      }
    }
    setSelectedProjectId((previous) => previous || (user.assignedProjectIds?.[0] ?? ''));
    setIsSupabaseLive(true);
  }, [clearData]);

  useEffect(() => {
    if (!supabaseConfigured) { setAuthLoading(false); return; }
    let active = true;
    supabase.auth.getSession().then(async ({ data, error }) => {
      if (error) console.error(error);
      if (active) {
        try { await loadProfileAndData(data.session); }
        catch (err) { console.error('Supabase initialization failed:', err); clearData(); }
        finally { if (active) setAuthLoading(false); }
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setAuthLoading(true);
      // Defer database reads out of the auth callback to avoid locking the auth client.
      window.setTimeout(async () => {
        if (!active) return;
        try { await loadProfileAndData(session); }
        catch (err) { console.error('Unable to load account data:', err); clearData(); }
        finally { if (active) setAuthLoading(false); }
      }, 0);
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [loadProfileAndData, clearData]);

  useEffect(() => {
    if (!currentUser?.uid) return;
    const channels = tables.map((table) => supabase.channel(`siteflow-${table}-${currentUser.uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
        const row = payload.new && Object.keys(payload.new).length ? fromDbRow<any>(payload.new as Record<string,unknown>) : null;
        const oldId = (payload.old as any)?.id;
        const apply = <T extends {id:string}>(setter: React.Dispatch<React.SetStateAction<T[]>>) => setter((previous) => payload.eventType === 'DELETE' ? previous.filter((item) => item.id !== oldId) : row ? [row as T, ...previous.filter((item) => item.id !== row.id)] : previous);
        switch (table) {
          case 'projects': apply(setProjects); break;
          case 'tasks': apply(setTasks); break;
          case 'daily_logs': apply(setDailyLogs); break;
          case 'expenses': apply(setExpenses); break;
          case 'documents': apply(setDocuments); break;
          case 'activities': apply(setActivities); break;
        }
      }).subscribe());
    return () => channels.forEach((channel) => { void supabase.removeChannel(channel); });
  }, [currentUser?.uid]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };
  const signUp = async (name: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { name, role: 'client' } } });
    if (error) throw error;
    // The database trigger in supabase/schema.sql creates the restricted client profile.
  };
  const signOut = async () => { const { error } = await supabase.auth.signOut(); if (error) throw error; clearData(); };

  const canAccessProject = useCallback((projectId: string) => { const project = projects.find((item) => item.id === projectId); return currentUser?.role === 'admin' || (currentUser?.assignedProjectIds || []).includes(projectId) || project?.pmId === currentUser?.uid || project?.supervisorId === currentUser?.uid; }, [currentUser, projects]);
  // Supabase RLS already filters the projects query to this authenticated user.
  const visibleProjects = projects;
  const selectedProject = projects.find((project) => project.id === selectedProjectId) || visibleProjects[0] || null;

  const insert = async <T extends {id:string}>(table: string, value: T): Promise<void> => {
    const { error } = await supabase.from(table).insert(toDbRow(value as unknown as Record<string, unknown>));
    if (error) throw error;
  };
  const update = async (table: string, id: string, updates: Record<string, unknown>) => {
    const { error } = await supabase.from(table).update(toDbRow(updates)).eq('id', id);
    if (error) throw error;
  };
  const logActivity = async (action: string, details: string, projectId: string) => {
    if (!currentUser?.uid) return;
    const project = projects.find((item) => item.id === projectId);
    const activity: ActivityItem = { id: newId(), projectId, projectName: project?.name || 'Project', timestamp: new Date().toISOString(), userName: currentUser.name, role: currentUser.role, action, details };
    await insert('activities', activity as unknown as {id:string});
  };

  const createProject = async (data: Omit<Project,'id'|'createdAt'>) => {
    const value: Project = { ...data, pmId: data.pmId || (currentUser.role === 'pm' ? currentUser.uid : undefined), pmName: data.pmName || (currentUser.role === 'pm' ? currentUser.name : ''), id: newId(), createdAt: new Date().toISOString() };
    await insert('projects', value as unknown as {id:string});
    const members = [value.pmId, value.supervisorId].filter((uid): uid is string => Boolean(uid));
    if (members.length) { const { error: memberError } = await supabase.from('project_members').insert(members.map((user_id) => ({ project_id: value.id, user_id }))); if (memberError) throw memberError; }
    await logActivity('Created Project', `Added new project "${value.name}"`, value.id);
    return value.id;
  };
  const updateProject = async (id: string, updates: Partial<Project>) => { await update('projects', id, updates as Record<string,unknown>); await logActivity('Updated Project','Modified project parameters',id); };
  const deleteProject = async (id: string) => { const { error } = await supabase.from('projects').delete().eq('id',id); if(error) throw error; };
  const createTask = async (data: Omit<Task,'id'|'createdAt'>) => {
    const project = projects.find((item) => item.id === data.projectId);
    const value: Task = { ...data, id: newId(), projectName: project?.name || 'Project', createdAt: new Date().toISOString() };
    await insert('tasks', value as unknown as {id:string}); await logActivity('Created Task',`Assigned task "${value.title}" (${value.trade})`,value.projectId); return value.id;
  };
  const updateTaskStatus = async (id: string, status: TaskStatus, blockReason?: string) => {
    const target = tasks.find((item) => item.id === id);
    await update('tasks', id, { status, blockReason: status === 'blocked' ? blockReason : null });
    if (target) await logActivity('Task Status Changed',`Marked "${target.title}" as ${status.toUpperCase()}`,target.projectId);
  };
  const updateTask = async (id: string, updates: Partial<Task>) => update('tasks',id,updates as Record<string,unknown>);
  const deleteTask = async (id: string) => { const {error}=await supabase.from('tasks').delete().eq('id',id); if(error) throw error; };
  const createDailyLog = async (data: Omit<DailyLog,'id'|'createdAt'>) => {
    const project=projects.find((item)=>item.id===data.projectId);
    const value:DailyLog={...data,id:newId(),projectName:project?.name||'Project',createdAt:new Date().toISOString()};
    try { await insert('daily_logs',value as unknown as {id:string}); } catch (error) { const paths = value.photos.map((photo) => photo.storagePath).filter((path): path is string => Boolean(path)); if (paths.length) await supabase.storage.from('daily-log-photos').remove(paths); throw error; }
    await logActivity('Logged Daily Site Report',`Submitted log for ${value.date}: ${value.crew.total} crew on site. ${value.photos?.length||0} photos attached.`,value.projectId); return value.id;
  };
  const deleteDailyLog = async (id:string) => { const target=dailyLogs.find((item)=>item.id===id); const paths=(target?.photos||[]).map((photo)=>photo.storagePath).filter((path):path is string=>Boolean(path)); if(paths.length){const {error:storageError}=await supabase.storage.from('daily-log-photos').remove(paths);if(storageError)throw storageError;} const {error}=await supabase.from('daily_logs').delete().eq('id',id);if(error)throw error; };
  const createExpense = async (data:Omit<Expense,'id'|'createdAt'>) => {
    const project=projects.find((item)=>item.id===data.projectId);
    const value:Expense={...data,id:newId(),projectName:project?.name||'Project',createdAt:new Date().toISOString()};
    await insert('expenses',value as unknown as {id:string}); await logActivity('Recorded Expense',`Logged KES ${data.amount.toLocaleString('en-KE')} for ${data.category.toUpperCase()} (${data.vendor})`,value.projectId); return value.id;
  };
  const deleteExpense = async (id:string) => {const {error}=await supabase.from('expenses').delete().eq('id',id);if(error)throw error;};
  const uploadDocumentFile = async (file:File, projectId:string) => {
    const path=`${projectId}/${newId()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
    const {error}=await supabase.storage.from('project-documents').upload(path,file,{upsert:false,contentType:file.type||'application/octet-stream'});
    if(error)throw error;
    const {data,error:signedError}=await supabase.storage.from('project-documents').createSignedUrl(path,3600);
    if(signedError)throw signedError;
    return {fileUrl:data.signedUrl,fileName:file.name,fileSize:`${(file.size/1024/1024).toFixed(2)} MB`,storagePath:path};
  };
  const uploadDailyPhoto = async (file:File, projectId:string, logId='pending') => {
    const path=`${projectId}/${logId}/${newId()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
    const {error}=await supabase.storage.from('daily-log-photos').upload(path,file,{upsert:false,contentType:file.type||'image/jpeg'});
    if(error)throw error;
    const {data:signed,error:signedError}=await supabase.storage.from('daily-log-photos').createSignedUrl(path,3600);
    if(signedError)throw signedError;
    return {url:signed.signedUrl,storagePath:path};
  };
  const createDocument = async (data:Omit<ProjectDocument,'id'|'uploadDate'>) => {
    const project=projects.find((item)=>item.id===data.projectId);
    const value:ProjectDocument={...data,id:newId(),projectName:project?.name||'Project',uploadDate:new Date().toISOString().slice(0,10)};
    try { await insert('documents',value as unknown as {id:string}); } catch (error) { if (value.storagePath) await supabase.storage.from('project-documents').remove([value.storagePath]); throw error; }
    await logActivity('Uploaded Document',`Added ${value.category.toUpperCase()}: "${value.title}"`,value.projectId); return value.id;
  };
  const deleteDocument = async (id:string) => {const target=documents.find((item)=>item.id===id);if(target?.storagePath){const {error:storageError}=await supabase.storage.from('project-documents').remove([target.storagePath]);if(storageError)throw storageError;}const {error}=await supabase.from('documents').delete().eq('id',id);if(error)throw error;};

  return <AppContext.Provider value={{currentUser,allUsers,projects,tasks,dailyLogs,expenses,documents,activities,selectedProjectId,setSelectedProjectId,selectedProject,signIn,signUp,signOut,createProject,updateProject,deleteProject,createTask,updateTaskStatus,updateTask,deleteTask,createDailyLog,deleteDailyLog,createExpense,deleteExpense,createDocument,uploadDocumentFile,uploadDailyPhoto,deleteDocument,isSupabaseLive,authLoading,canAccessProject,visibleProjects}}>{children}</AppContext.Provider>;
}

export function useApp() { const context=useContext(AppContext); if(!context) throw new Error('useApp must be used within AppProvider'); return context; }
