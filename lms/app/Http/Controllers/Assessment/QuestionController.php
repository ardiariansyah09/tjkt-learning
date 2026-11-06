<?php

namespace App\Http\Controllers\Assessment;

use App\Http\Controllers\Controller;
use App\Http\Requests\QuestionRequest;
use App\Models\Question;
use App\Services\AuditService;
use App\Services\QuestionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class QuestionController extends Controller
{
    public function index(Request $r, QuestionService $service)
    {
        Gate::authorize('viewAny', Question::class);
        $data = $r->validate(['q' => 'nullable|string|max:100', 'type' => 'nullable|in:single,multiple,boolean,matching,ordering,short,scenario']);
        $q = $service->visible($r->user());
        if ($r->filled('q')) {
            $q->where('prompt', 'like', '%'.addcslashes($data['q'], '%_\\').'%');
        }if ($r->filled('type')) {
            $q->where('type', $data['type']);
        }$questions = $q->with('author')->latest()->paginate(15)->withQueryString();

        return view('assessment.questions.index', compact('questions'));
    }

    public function create()
    {
        Gate::authorize('create', Question::class);
        $question = new Question(['type' => 'single', 'points' => 1, 'is_shared' => false]);

        return view('assessment.questions.form', compact('question'));
    }

    public function store(QuestionRequest $r, QuestionService $s)
    {
        $q = $s->save($r->user(), $r->validated());

        return redirect()->route('assessment.questions.edit', $q)->with('status', 'Soal dibuat. Tambahkan ke aktivitas melalui editor aktivitas modul.');
    }

    public function edit(Question $question)
    {
        Gate::authorize('update', $question);
        $question->load('options');

        return view('assessment.questions.form', compact('question'));
    }

    public function update(QuestionRequest $r, Question $question, QuestionService $s)
    {
        $s->save($r->user(), $r->validated(), $question);

        return back()->with('status', 'Bank soal diperbarui. Versi aktivitas dan percobaan lama tetap tersimpan. Terbitkan ulang aktivitas untuk memakai perubahan ini.');
    }

    public function destroy(Request $r, Question $question, AuditService $audit)
    {
        Gate::authorize('delete', $question);
        $question->delete();
        $audit->record('question.archived', $r->user()->id, ['question_id' => $question->id]);

        return redirect()->route('assessment.questions.index')->with('status', 'Soal diarsipkan. Snapshot aktivitas dan percobaan tidak dihapus.');
    }
}
